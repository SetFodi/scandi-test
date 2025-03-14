<?php
// backend/graphql/resolvers.php
require_once __DIR__ . '/../models/ProductRepository.php';
require_once __DIR__ . '/../models/Category.php';

// Load the JSON data
$jsonData = file_get_contents(__DIR__ . '/../../data.json');
$repository = new ProductRepository($jsonData);

$resolvers = [
    'Query' => [
        'categories' => function() use ($repository) {
            return array_map(function($category) {
                return $category->toArray();
            }, $repository->getAllCategories());
        },
        'products' => function($parent, $args) use ($repository) {
            $categoryName = $args['categoryName'] ?? 'all';
            return array_map(function($product) {
                return $product->toArray();
            }, $repository->getProductsByCategory($categoryName));
        },
        'product' => function($parent, $args) use ($repository) {
            $product = $repository->getProductById($args['id']);
            return $product ? $product->toArray() : null;
        }
    ],
    'Mutation' => [
        'placeOrder' => function($parent, $args) use ($repository) {
            // In a real application, this would save the order to a database
            // For this test, we'll just return a dummy order with the given products
            $orderId = uniqid('order_');
            $total = 0;
            $orderProducts = [];
            
            foreach ($args['products'] as $productInput) {
                $product = $repository->getProductById($productInput['productId']);
                if ($product) {
                    // Get the USD price (assuming there's only one price in the list)
                    $price = $product->getPrices()[0]['amount'] ?? 0;
                    $total += $price * $productInput['quantity'];
                    
                    $orderProducts[] = [
                        'product' => $product->toArray(),
                        'quantity' => $productInput['quantity'],
                        'selectedAttributes' => $productInput['selectedAttributes']
                    ];
                }
            }
            
            return [
                'id' => $orderId,
                'products' => $orderProducts,
                'total' => $total
            ];
        }
    ]
];

return $resolvers;
