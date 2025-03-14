<?php
// backend/models/SwatchAttribute.php
require_once 'AbstractAttribute.php';

class SwatchAttribute extends AbstractAttribute {
    public function toArray() {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'type' => 'swatch',
            'items' => $this->items,
            '__typename' => 'AttributeSet'
        ];
    }
}
