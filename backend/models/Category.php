<?php
// backend/models/Category.php
class Category {
    private $name;

    public function __construct(string $name) {
        $this->name = $name;
    }

    public function getName() {
        return $this->name;
    }

    public function toArray() {
        return [
            'name' => $this->name,
            '__typename' => 'Category'
        ];
    }
}
