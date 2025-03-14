<?php
// backend/models/AbstractProduct.php
abstract class AbstractProduct {
    protected $id;
    protected $name;
    protected $inStock;
    protected $gallery;
    protected $description;
    protected $category;
    protected $prices;
    protected $brand;

    // Constructor that accepts an associative array of product data
    public function __construct(array $data = []) {
        $this->id = $data['id'] ?? '';
        $this->name = $data['name'] ?? '';
        $this->inStock = $data['inStock'] ?? true;
        $this->gallery = $data['gallery'] ?? [];
        $this->description = $data['description'] ?? '';
        $this->category = $data['category'] ?? '';
        $this->prices = $data['prices'] ?? [];
        $this->brand = $data['brand'] ?? '';
    }

    // Abstract method that must be implemented by child classes
    abstract public function getAttributes();

    // Common methods for all product types
    public function getId() {
        return $this->id;
    }

    public function getName() {
        return $this->name;
    }

    public function isInStock() {
        return $this->inStock;
    }

    public function getGallery() {
        return $this->gallery;
    }

    public function getDescription() {
        return $this->description;
    }

    public function getCategory() {
        return $this->category;
    }

    public function getPrices() {
        return $this->prices;
    }

    public function getBrand() {
        return $this->brand;
    }

    // Method to convert product to array for GraphQL response
    public function toArray() {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'inStock' => $this->inStock,
            'gallery' => $this->gallery,
            'description' => $this->description,
            'category' => $this->category,
            'prices' => $this->prices,
            'brand' => $this->brand,
            'attributes' => $this->getAttributes(),
            '__typename' => 'Product'
        ];
    }
}
