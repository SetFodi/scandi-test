<?php
// backend/public/index.php

// Enable error reporting for debugging.
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Log startup for debugging.
error_log("Starting PHP server...");

// Set CORS headers so that the frontend can access this API.
header('Access-Control-Allow-Origin: *'); // Replace with Vercel URL later
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');

// Handle pre-flight OPTIONS request.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Include the Database connection class.
require_once __DIR__ . '/config/Database.php';

// Connect to the database.
$db = new Database();
$conn = $db->connect();
if (!$conn) {
    error_log("Database connection failed");
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}
error_log("Database connected successfully");

// Read the incoming POST request body.
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);
$query = $input['query'] ?? '';
$variables = $input['variables'] ?? [];

// Prepare the response structure.
$response = ['data' => []];

/**
 * Enrich a product row with additional data:
 *  - Convert in_stock to inStock (boolean).
 *  - Append a gallery field (array of image URLs).
 *  - Append a prices field (array of objects with amount and currency).
 *  - Append an attributes field (array of attribute sets with items).
 */
function enrichProduct($conn, $product) {
    // Convert in_stock to inStock (boolean) and remove the original key.
    $product['inStock'] = (bool)$product['in_stock'];
    unset($product['in_stock']);
    
    // Get gallery images for the product.
    $galStmt = $conn->prepare("SELECT image_url FROM product_gallery WHERE product_id = :id ORDER BY id ASC");
    $galStmt->execute([':id' => $product['id']]);
    $gallery = $galStmt->fetchAll(PDO::FETCH_COLUMN);
    $product['gallery'] = $gallery;
    
    // Get prices for the product.
    $priceStmt = $conn->prepare("SELECT amount, currency_label, currency_symbol FROM prices WHERE product_id = :id ORDER BY id ASC");
    $priceStmt->execute([':id' => $product['id']]);
    $pricesRaw = $priceStmt->fetchAll(PDO::FETCH_ASSOC);
    $prices = [];
    foreach ($pricesRaw as $p) {
         $prices[] = [
             'amount' => (float)$p['amount'],
             'currency' => [
                 'label' => $p['currency_label'],
                 'symbol' => $p['currency_symbol']
             ]
         ];
    }
    $product['prices'] = $prices;
    
    // Get attributes for the product.
    $attrStmt = $conn->prepare(
        "SELECT asets.id AS set_id, asets.name, asets.type 
         FROM attribute_sets asets
         INNER JOIN product_attributes pa ON pa.attribute_set_id = asets.id
         WHERE pa.product_id = :id"
    );
    $attrStmt->execute([':id' => $product['id']]);
    $attributeSets = $attrStmt->fetchAll(PDO::FETCH_ASSOC);
    $attributes = [];
    foreach ($attributeSets as $aset) {
         $itemStmt = $conn->prepare("SELECT id, display_value, value FROM attribute_items WHERE set_id = :set_id");
         $itemStmt->execute([':set_id' => $aset['set_id']]);
         $items = $itemStmt->fetchAll(PDO::FETCH_ASSOC);
         $reformattedItems = [];
         foreach ($items as $item) {
             $reformattedItems[] = [
                'id' => $item['id'],
                'displayValue' => $item['display_value'],
                'value' => $item['value']
             ];
         }
         $attributes[] = [
             'id' => $aset['set_id'],
             'name' => $aset['name'],
             'type' => $aset['type'],
             'items' => $reformattedItems
         ];
    }
    $product['attributes'] = $attributes;
    return $product;
}

// --- Handle GraphQL Queries ---
if (strpos($query, 'categories') !== false) {
    $stmt = $conn->prepare("SELECT name FROM categories");
    $stmt->execute();
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $response['data']['categories'] = $categories;
} elseif (preg_match('/products\(categoryName:\s*"?([^"]*)"?\)/', $query, $matches)) {
    $categoryName = $matches[1] ?? 'all';
    if ($categoryName === '$categoryName' && isset($variables['categoryName'])) {
        $categoryName = $variables['categoryName'];
    }
    
    if ($categoryName === 'all' || empty($categoryName)) {
        $stmt = $conn->prepare("SELECT * FROM products");
        $stmt->execute();
    } else {
        $stmt = $conn->prepare("SELECT * FROM products WHERE category = :category");
        $stmt->execute([':category' => $categoryName]);
    }
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $enriched = [];
    foreach ($products as $prod) {
         $enriched[] = enrichProduct($conn, $prod);
    }
    $response['data']['products'] = $enriched;
} elseif (strpos($query, 'product(id:') !== false) {
    $productId = null;
    if (preg_match('/product\(id:\s*"([^"]+)"/', $query, $matches)) {
        $productId = $matches[1];
    } elseif (strpos($query, 'product(id: $id') !== false && isset($variables['id'])) {
        $productId = $variables['id'];
    }
    if ($productId) {
        $stmt = $conn->prepare("SELECT * FROM products WHERE id = :id");
        $stmt->execute([':id' => $productId]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($product) {
             $product = enrichProduct($conn, $product);
        }
        $response['data']['product'] = $product;
    } else {
        $response['data']['product'] = null;
    }
} elseif (strpos($query, 'placeOrder') !== false) {
    $response['data']['placeOrder'] = [
        'id' => 'order_' . uniqid(),
        'total' => rand(100, 1000) / 100
    ];
}

header('Content-Type: application/json');
echo json_encode($response);

// If this script is run directly (e.g., not via a server), start PHP's built-in server.
if (php_sapi_name() === 'cli' && isset($argv[0]) && realpath($argv[0]) === __FILE__) {
    $port = getenv('PORT') ?: '8080';
    error_log("Running PHP server on port $port");
    exec("php -S 0.0.0.0:$port -t " . __DIR__);
}
