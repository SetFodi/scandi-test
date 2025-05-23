<?php
// backend/index.php

error_reporting(E_ALL);
ini_set('display_errors', 1);

error_log("PHP application running on port 9000");

header('Access-Control-Allow-Origin: https://scandi-test-sepia.vercel.app');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config/Database.php';

$db = new Database();
$conn = $db->connect();
if (!$conn) {
    error_log("Database connection failed");
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}
error_log("Database connected successfully");

$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);
$query = $input['query'] ?? '';
$variables = $input['variables'] ?? [];

$response = ['data' => []];

function enrichProduct($conn, $product) {
    $product['inStock'] = (bool)$product['in_stock'];
    unset($product['in_stock']);
    
    // Fix for gallery - parse from the JSON string in the products table
    if (!empty($product['gallery'])) {
        // Parse the JSON string to get the gallery array
        $product['gallery'] = json_decode($product['gallery'], true);
        
        // If parsing failed, provide a fallback empty array
        if ($product['gallery'] === null) {
            error_log("Failed to parse gallery JSON for product ID: " . $product['id']);
            $product['gallery'] = [];
        }
    } else {
        $product['gallery'] = [];
    }
    
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
    error_log("Fetching product with ID: " . ($productId ?? 'null'));
    if ($productId) {
        $stmt = $conn->prepare("SELECT * FROM products WHERE id = :id");
        $stmt->execute([':id' => $productId]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($product) {
            $response['data']['product'] = enrichProduct($conn, $product);
        } else {
            error_log("Product not found for ID: $productId");
            $response['data']['product'] = null;
        }
    } else {
        error_log("No product ID provided");
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

