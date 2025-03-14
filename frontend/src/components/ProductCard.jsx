// frontend/src/components/ProductCard.jsx
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { CartContext } from '../context/CartContext';

const Card = styled(Link)`
  display: block;
  padding: 1rem;
  position: relative;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0px 4px 35px rgba(168, 172, 176, 0.19);
  }
`;

const ProductImage = styled.div`
  width: 100%;
  height: 330px;
  margin-bottom: 1rem;
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: ${props => props.outOfStock ? 'opacity(0.5)' : 'none'};
  }
`;

const OutOfStockLabel = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-transform: uppercase;
  color: #8D8F9A;
  font-size: 1.5rem;
  font-weight: 400;
`;

const ProductName = styled.h3`
  font-weight: 300;
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
`;

const ProductPrice = styled.p`
  font-weight: 500;
  font-size: 1.125rem;
`;

const QuickAddButton = styled.button`
  position: absolute;
  bottom: 72px;
  right: 31px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background-color: #5ECE7B;
  color: white;
  border: none;
  display: ${props => props.visible && !props.outOfStock ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1;
`;

function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext);
  const [hover, setHover] = React.useState(false);
  
  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Get default attributes (first of each attribute)
    const defaultAttributes = product.attributes.map(attr => ({
      id: attr.id,
      value: attr.items[0].value
    }));
    
    addToCart(product, defaultAttributes);
  };
  
  return (
    <Card 
      to={`/product/${product.id}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      data-testid={`product-${product.name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <ProductImage outOfStock={!product.inStock}>
        <img src={product.gallery[0]} alt={product.name} />
        {!product.inStock && <OutOfStockLabel>Out of stock</OutOfStockLabel>}
      </ProductImage>
      <ProductName>{product.brand} {product.name}</ProductName>
      <ProductPrice>{product.prices[0].currency.symbol}{product.prices[0].amount.toFixed(2)}</ProductPrice>
      
      <QuickAddButton 
        onClick={handleQuickAdd} 
        visible={hover}
        outOfStock={!product.inStock}
      >
        🛒
      </QuickAddButton>
    </Card>
  );
}

export default ProductCard;
