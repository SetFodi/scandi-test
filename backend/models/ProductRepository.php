<?php
// backend/models/ProductRepository.php
require_once 'ClothingProduct.php';
require_once 'TechProduct.php';

class ProductRepository {
    private $data;

    public function __construct($jsonData) {
        $this->data = json_decode($jsonData, true)['data'];
    }

    public function getAllCategories() {
        $categories = [];
        foreach ($this->data['categories'] as $categoryData) {
            $categories[] = new Category($categoryData['name']);
        }
        return $categories;
    }

    public function getAllProducts() {
        $products = [];
        foreach ($this->data['products'] as $productData) {
            if ($productData['category'] === 'clothes') {
                $products[] = new ClothingProduct($productData);
            } else {
                $products[] = new TechProduct($productData);
            }
        }
        return $products;
    }

    public function getProductsByCategory($category) {
        return array_filter($this->getAllProducts(), function($product) use ($category) {
            return $category === 'all' || $product->getCategory() === $category;
        });
    }

    public function getProductById($id) {
        foreach ($this->getAllProducts() as $product) {
            if ($product->getId() === $id) {
                return $product;
            }
        }
        return null;
    }
}
