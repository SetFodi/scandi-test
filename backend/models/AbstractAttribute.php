<?php
// backend/models/AbstractAttribute.php
abstract class AbstractAttribute {
    protected $id;
    protected $name;
    protected $type;
    protected $items;

    public function __construct(array $data = []) {
        $this->id = $data['id'] ?? '';
        $this->name = $data['name'] ?? '';
        $this->type = $data['type'] ?? '';
        $this->items = $data['items'] ?? [];
    }

    public function getId() {
        return $this->id;
    }

    public function getName() {
        return $this->name;
    }

    public function getType() {
        return $this->type;
    }

    public function getItems() {
        return $this->items;
    }

    abstract public function toArray();
}
