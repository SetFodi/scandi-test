<?php
// backend/models/TextAttribute.php
require_once 'AbstractAttribute.php';

class TextAttribute extends AbstractAttribute {
    public function toArray() {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'type' => 'text',
            'items' => $this->items,
            '__typename' => 'AttributeSet'
        ];
    }
}
