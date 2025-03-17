// frontend/src/pages/ProductPage.jsx
import React, { useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import styled from 'styled-components';
import parse from 'html-react-parser';
import { GET_PRODUCT } from '../graphql/queries';
import { CartContext } from '../context/CartContext';

const ProductContainer = styled.div`
  display: flex;
  padding: 3rem 5rem;
  gap: 8rem;
  max-width: 1400px;
  margin: 0 auto;
  @media (max-width: 1024px) {
    flex-direction: column;
    padding: 2rem;
    gap: 3rem;
  }
`;

const GalleryContainer = styled.div`
  display: flex;
  gap: 2rem;
  flex: 1;
  @media (max-width: 768px) {
    flex-direction: column-reverse;
  }
`;

const ThumbnailContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  @media (max-width: 768px) {
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }
`;

const Thumbnail = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  cursor: pointer;
  border: ${props => (props.selected ? '2px solid #5ECE7B' : '1px solid #E5E5E5')};
  border-radius: 2px;
  transition: all 0.2s ease;
  &:hover {
    transform: ${props => (props.selected ? 'none' : 'scale(1.05)')};
    box-shadow: ${props => (props.selected ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.1)')};
  }
`;

const MainImageContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
  border-radius: 4px;
  padding: 2rem;
`;

const MainImage = styled.img`
  max-width: 100%;
  max-height: 550px;
  object-fit: contain;
`;

const InfoContainer = styled.div`
  flex: 1;
  max-width: 500px;
`;

const Brand = styled.h2`
  font-weight: 600;
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #1d1f22;
`;

const ProductName = styled.h3`
  font-weight: 400;
  font-size: 1.75rem;
  margin-bottom: 2.5rem;
  color: #1d1f22;
`;

const AttributeContainer = styled.div`
  margin-bottom: 2rem;
`;

const AttributeName = styled.h4`
  font-family: 'Roboto Condensed', sans-serif;
  font-weight: 700;
  font-size: 1.125rem;
  text-transform: uppercase;
  margin-bottom: 0.75rem;
  letter-spacing: 0.05em;
`;

const AttributeOptions = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const AttributeOption = styled.button`
  padding: 0.75rem;
  min-width: 63px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Source Sans Pro', sans-serif;
  border: 1px solid #1d1f22;
  background: ${props => (props.selected ? '#1d1f22' : 'white')};
  color: ${props => (props.selected ? 'white' : '#1d1f22')};
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background: ${props => (props.selected ? '#1d1f22' : '#f9f9f9')};
    transform: ${props => (props.selected ? 'none' : 'translateY(-2px)')};
    box-shadow: ${props => (props.selected ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.1)')};
  }
`;

const ColorOption = styled.button`
  width: 36px;
  height: 36px;
  background-color: ${props => props.color};
  border: ${props => (props.selected ? '2px solid #5ECE7B' : '1px solid #E5E5E5')};
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    transform: ${props => (props.selected ? 'none' : 'scale(1.1)')};
    box-shadow: ${props => (props.selected ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.1)')};
  }
`;

const PriceContainer = styled.div`
  margin-bottom: 2rem;
  border-top: 1px solid #e5e5e5;
  padding-top: 1.5rem;
`;

const PriceLabel = styled.h4`
  font-family: 'Roboto Condensed', sans-serif;
  font-weight: 700;
  font-size: 1.125rem;
  text-transform: uppercase;
  margin-bottom: 0.75rem;
  letter-spacing: 0.05em;
`;

const Price = styled.p`
  font-weight: 700;
  font-size: 1.5rem;
  color: #1d1f22;
`;

const AddToCartButton = styled.button`
  width: 100%;
  padding: 1.25rem;
  background-color: ${props => (props.disabled ? '#e5e5e5' : '#5ece7b')};
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  font-size: 1rem;
  text-transform: uppercase;
  margin-bottom: 2.5rem;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s ease;
  letter-spacing: 0.05em;
  box-shadow: ${props => (props.disabled ? 'none' : '0 4px 10px rgba(94, 206, 123, 0.3)')};
  &:hover {
    background-color: ${props => (props.disabled ? '#e5e5e5' : '#4caf50')};
    transform: ${props => (props.disabled ? 'none' : 'translateY(-2px)')};
    box-shadow: ${props => (props.disabled ? 'none' : '0 6px 14px rgba(94, 206, 123, 0.4)')};
  }
`;

const OutOfStockButton = styled(AddToCartButton)`
  background-color: #e5e5e5;
  color: #757575;
  font-weight: 500;
  box-shadow: none;
  &:hover {
    background-color: #e5e5e5;
    transform: none;
    box-shadow: none;
  }
`;

const DescriptionContainer = styled.div`
  font-family: 'Roboto', sans-serif;
  font-weight: 400;
  line-height: 1.8;
  color: #454545;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e5e5;
  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 1.5rem 0 0.75rem;
    color: #1d1f22;
  }
  p {
    margin-bottom: 1.25rem;
  }
  ul,
  ol {
    margin-left: 1.5rem;
    margin-bottom: 1.25rem;
  }
  li {
    margin-bottom: 0.5rem;
  }
`;

function ProductPage() {
  const { productId } = useParams();
  const { addToCart } = useContext(CartContext);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedAttributes, setSelectedAttributes] = useState({});

  const { loading, error, data } = useQuery(GET_PRODUCT, {
    variables: { id: productId },
  });

  if (loading)
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
        <p>Loading product details...</p>
      </div>
    );

  if (error)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem' }}>
        <p style={{ color: '#D32F2F', marginBottom: '1rem' }}>Error loading product: {error.message}</p>
        <button
          onClick={() => window.location.reload()}
          style={{ padding: '0.75rem 1.5rem', background: '#1D1F22', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          Try Again
        </button>
      </div>
    );

  const product = data?.product;
  if (!product)
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
        <p>Product not found</p>
      </div>
    );

  const handleAttributeSelect = (attributeId, value) => {
    setSelectedAttributes(prev => ({
      ...prev,
      [attributeId]: value,
    }));
  };

  const handleAddToCart = () => {
    const attributesArray = Object.entries(selectedAttributes).map(([id, value]) => ({
      id,
      value,
    }));
    addToCart(product, attributesArray);
  };

  const allAttributesSelected = product.attributes.length === Object.keys(selectedAttributes).length;

  return (
    <ProductContainer>
      <GalleryContainer data-testid="product-gallery">
        <ThumbnailContainer>
          {product.gallery.map((image, index) => (
            <Thumbnail
              key={index}
              src={image}
              alt={`${product.name} thumbnail ${index}`}
              selected={index === selectedImage}
              onClick={() => setSelectedImage(index)}
            />
          ))}
        </ThumbnailContainer>
        <MainImageContainer>
          <MainImage src={product.gallery[selectedImage]} alt={product.name} />
        </MainImageContainer>
      </GalleryContainer>

      <InfoContainer>
        <Brand>{product.brand}</Brand>
        <ProductName>{product.name}</ProductName>

        {product.attributes.map(attribute => (
          <AttributeContainer
            key={attribute.id}
            data-testid={`product-attribute-${attribute.name.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <AttributeName>{attribute.name}:</AttributeName>
            <AttributeOptions>
              {attribute.items.map(item => {
                const isSelected = selectedAttributes[attribute.id] === item.value;
                if (attribute.type === 'swatch') {
                  return (
                  <ColorOption
                    key={item.id}
                    color={item.value}
                    selected={isSelected}
                    onClick={() => handleAttributeSelect(attribute.id, item.value)}
                    data-testid={`product-attribute-${attribute.name.toLowerCase().replace(/\s+/g, '-')}-${
                      item.value.startsWith('#') ? item.value.toUpperCase() : item.displayValue
                    }`}
                  />

                  );
                }
                return (
                <AttributeOption
                  key={item.id}
                  selected={isSelected}
                  onClick={() => handleAttributeSelect(attribute.id, item.value)}
                  data-testid={`product-attribute-${attribute.name.toLowerCase().replace(/\s+/g, '-')}-${item.value}`}
                >
                  {item.displayValue}
                </AttributeOption>

                );
              })}
            </AttributeOptions>
          </AttributeContainer>
        ))}

        <PriceContainer>
          <PriceLabel>Price:</PriceLabel>
          <Price>{product.prices[0].currency.symbol}{product.prices[0].amount.toFixed(2)}</Price>
        </PriceContainer>

        {product.inStock ? (
          <AddToCartButton
            onClick={handleAddToCart}
            disabled={!allAttributesSelected}
            data-testid="add-to-cart"
          >
            Add to cart
          </AddToCartButton>
        ) : (
          <OutOfStockButton disabled data-testid="out-of-stock">
            Out of stock
          </OutOfStockButton>
        )}

        <DescriptionContainer data-testid="product-description">{parse(product.description)}</DescriptionContainer>
      </InfoContainer>
    </ProductContainer>
  );
}

export default ProductPage;
