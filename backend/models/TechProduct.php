<?php
// backend/models/TechProduct.php
require_once 'AbstractProduct.php';

class TechProduct extends AbstractProduct {
    protected $attributes;

    public function __construct(array $data = []) {
        parent::__construct($data);
        $this->attributes = $data['attributes'] ?? [];
    }

    public function getAttributes() {
        return $this->attributes;
    }
}
