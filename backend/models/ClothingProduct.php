<?php
// backend/models/ClothingProduct.php
require_once 'AbstractProduct.php';

class ClothingProduct extends AbstractProduct {
    protected $attributes;

    public function __construct(array $data = []) {
        parent::__construct($data);
        $this->attributes = $data['attributes'] ?? [];
    }

    public function getAttributes() {
        return $this->attributes;
    }
}
