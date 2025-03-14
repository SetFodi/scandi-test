<?php
// backend/public/index.php

// Enable error reporting for debugging.
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set CORS headers so that the frontend can access this API.
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');

// Handle pre-flight OPTIONS request.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// Include the Database connection class. (Correct relative path)
require_once __DIR__ . '/config/Database.php';

// Connect to the database.
$db = new Database();
$conn = $db->connect();

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
         // For each attribute set, get its items.
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

// 1. Categories Query: Return all category names.
if (strpos($query, 'categories') !== false) {
    $stmt = $conn->prepare("SELECT name FROM categories");
    $stmt->execute();
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $response['data']['categories'] = $categories;
}
// 2. Products Query (optionally filtering by category).
elseif (preg_match('/products\(categoryName:\s*"?([^"]*)"?\)/', $query, $matches)) {
    $categoryName = $matches[1] ?? 'all';
    // If the captured value is "$categoryName", replace it with the variable value.
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
    
    // Enrich each product with gallery, prices, and attributes.
    $enriched = [];
    foreach ($products as $prod) {
         $enriched[] = enrichProduct($conn, $prod);
    }
    $response['data']['products'] = $enriched;
}
// 3. Single Product Query.
elseif (strpos($query, 'product(id:') !== false) {
    $productId = null;
    // Attempt to extract a quoted id.
    if (preg_match('/product\(id:\s*"([^"]+)"/', $query, $matches)) {
        $productId = $matches[1];
    }
    // If not quoted, check for a variable-based query.
    elseif (strpos($query, 'product(id: $id') !== false && isset($variables['id'])) {
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
}
// 4. Place Order Mutation.
elseif (strpos($query, 'placeOrder') !== false) {
    $response['data']['placeOrder'] = [
        'id' => 'order_' . uniqid(),
        'total' => rand(100, 1000) / 100
    ];
}

header('Content-Type: application/json');
echo json_encode($response);
