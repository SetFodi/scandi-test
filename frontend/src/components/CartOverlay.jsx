// frontend/src/components/CartOverlay.jsx
import React, { useContext } from 'react';
import { useMutation } from '@apollo/client';
import styled from 'styled-components';
import { CartContext } from '../context/CartContext';
import { PLACE_ORDER } from '../graphql/mutations';

const CartOverlayContainer = styled.div`
  position: absolute;
  top: 80px;
  right: 0;
  width: 325px;
  max-height: 540px;
  background: white;
  z-index: 10;
  padding: 1rem;
  box-shadow: 0 4px 35px rgba(168, 172, 176, 0.19);
  overflow-y: auto;
`;

const CartTitle = styled.h3`
  font-weight: 700;
  margin-bottom: 1rem;
`;

const CartItemContainer = styled.div`
  display: flex;
  padding: 1rem 0;
  border-bottom: 1px solid #e5e5e5;
`;

const ItemDetails = styled.div`
  flex: 1;
`;

const ItemName = styled.p`
  font-weight: 300;
  margin-bottom: 0.5rem;
`;

const ItemPrice = styled.p`
  font-weight: 500;
  margin-bottom: 0.5rem;
`;

const AttributeContainer = styled.div`
  margin-top: 0.5rem;
`;

const AttributeTitle = styled.p`
  font-size: 0.75rem;
  font-weight: 400;
  margin-bottom: 0.25rem;
`;

const AttributeOptions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const AttributeOption = styled.div`
  padding: 0.25rem 0.5rem;
  border: 1px solid #1d1f22;
  font-size: 0.75rem;
  background: ${props => (props.selected ? '#1d1f22' : 'transparent')};
  color: ${props => (props.selected ? 'white' : '#1d1f22')};
`;

const ColorOption = styled.div`
  width: 20px;
  height: 20px;
  background-color: ${props => props.color};
  border: ${props => (props.selected ? '2px solid #5ece7b' : '1px solid #1d1f22')};
`;

const ItemControls = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  margin-left: 1rem;
`;

const QuantityControl = styled.button`
  width: 24px;
  height: 24px;
  background: transparent;
  border: 1px solid #1d1f22;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const Quantity = styled.span`
  font-weight: 500;
`;

const ItemImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  margin-left: 1rem;
`;

const CartTotal = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  font-weight: 700;
`;

const CartActions = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1rem;
  gap: 0.5rem;
`;

const OrderButton = styled.button`
  background: #5ece7b;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  font-weight: 600;
  text-transform: uppercase;
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

function CartOverlay({ onClose }) {
  const { cart, updateQuantity, cartTotal, clearCart } = useContext(CartContext);
  const [placeOrder, { loading }] = useMutation(PLACE_ORDER);

  const handleOrderSubmit = async () => {
    try {
      const orderProducts = cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        selectedAttributes: item.selectedAttributes,
      }));
      await placeOrder({ variables: { products: orderProducts } });
      alert('Order placed successfully!');
      clearCart();
      onClose();
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  return (
    <CartOverlayContainer data-testid="cart-overlay">
      <CartTitle>
        <b>My Bag,</b> {cart.length === 1 ? '1 item' : `${cart.reduce((sum, item) => sum + item.quantity, 0)} items`}
      </CartTitle>

      {cart.length === 0 && <p>Your cart is empty</p>}

      {cart.map((item, index) => (
        <CartItemContainer key={`${item.product.id}-${index}`}>
          <ItemDetails>
            <ItemName>{item.product.brand} {item.product.name}</ItemName>
            <ItemPrice>{item.product.prices[0].currency.symbol}{item.product.prices[0].amount.toFixed(2)}</ItemPrice>
            {item.product.attributes.map(attribute => (
              <AttributeContainer
                key={attribute.id}
                data-testid={`cart-item-attribute-${attribute.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <AttributeTitle>{attribute.name}:</AttributeTitle>
                <AttributeOptions>
                  {attribute.items.map(option => {
                    const isSelected = item.selectedAttributes.some(
                      attr => attr.id === attribute.id && attr.value === option.value
                    );
                    const testIdBase = `cart-item-attribute-${attribute.name.toLowerCase().replace(/\s+/g, '-')}-${option.value.toLowerCase().replace(/\s+/g, '-')}`;
                    if (attribute.type === 'swatch') {
                      return (
                        <ColorOption
                          key={option.id}
                          color={option.value}
                          selected={isSelected}
                          data-testid={isSelected ? `${testIdBase}-selected` : testIdBase}
                        />
                      );
                    }
                    return (
                      <AttributeOption
                        key={option.id}
                        selected={isSelected}
                        data-testid={isSelected ? `${testIdBase}-selected` : testIdBase}
                      >
                        {option.displayValue}
                      </AttributeOption>
                    );
                  })}
                </AttributeOptions>
              </AttributeContainer>
            ))}
          </ItemDetails>
          <ItemControls>
            <QuantityControl
              onClick={() => updateQuantity(index, item.quantity + 1)}
              data-testid="cart-item-amount-increase"
            >
              +
            </QuantityControl>
            <Quantity data-testid="cart-item-amount">{item.quantity}</Quantity>
            <QuantityControl
              onClick={() => updateQuantity(index, item.quantity - 1)}
              data-testid="cart-item-amount-decrease"
            >
              -
            </QuantityControl>
          </ItemControls>
          <ItemImage src={item.product.gallery[0]} alt={item.product.name} />
        </CartItemContainer>
      ))}

      <CartTotal data-testid="cart-total">
        <span>Total</span>
        <span>${cartTotal.toFixed(2)}</span>
      </CartTotal>

      <CartActions>
        <OrderButton onClick={handleOrderSubmit} disabled={cart.length === 0 || loading}>
          {loading ? 'Processing...' : 'Order'}
        </OrderButton>
      </CartActions>
    </CartOverlayContainer>
  );
}

export default CartOverlay;
