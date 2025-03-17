// frontend/src/context/CartContext.js
import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    // Load cart from localStorage when component mounts
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  // Add state for cart visibility
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Add product to cart
  const addToCart = (product, selectedAttributes) => {
    setCart(prevCart => {
      // Check if this product with these exact attributes is already in cart
      const existingItemIndex = prevCart.findIndex(item => {
        if (item.product.id !== product.id) return false;
        
        // Check if attributes match
        if (item.selectedAttributes.length !== selectedAttributes.length) return false;
        
        return item.selectedAttributes.every(attr => {
          const matchingAttr = selectedAttributes.find(a => a.id === attr.id);
          return matchingAttr && matchingAttr.value === attr.value;
        });
      });

      if (existingItemIndex >= 0) {
        // Product already exists with same attributes, increase quantity
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += 1;
        return updatedCart;
      } else {
        // Add new product to cart
        return [...prevCart, { product, selectedAttributes, quantity: 1 }];
      }
    });
    
    // Automatically open cart overlay when adding to cart
    setIsCartOpen(true);
  };

  // Remove product from cart
  const removeFromCart = (index) => {
    setCart(prevCart => prevCart.filter((_, i) => i !== index));
  };

  // Update product quantity
  const updateQuantity = (index, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(index);
      return;
    }
    
    setCart(prevCart => {
      const updatedCart = [...prevCart];
      updatedCart[index].quantity = newQuantity;
      return updatedCart;
    });
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
  };

  // Calculate total items in cart
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate cart total
  const cartTotal = cart.reduce((sum, item) => {
    // Assuming first price is USD
    const price = item.product.prices[0].amount;
    return sum + (price * item.quantity);
  }, 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      cartTotal,
      isCartOpen,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
};

