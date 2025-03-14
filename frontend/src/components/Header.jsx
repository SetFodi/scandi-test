// frontend/src/components/Header.jsx
import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import styled from 'styled-components';
import { GET_CATEGORIES } from '../graphql/queries';
import { CartContext } from '../context/CartContext';
import CartOverlay from './CartOverlay';

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  border-bottom: 1px solid #e5e5e5;
`;

const NavContainer = styled.nav`
  display: flex;
  gap: 1rem;
`;

const NavLink = styled(Link)`
  text-decoration: none;
  color: #1D1F22;
  padding: 0.5rem 1rem;
  text-transform: uppercase;
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  border-bottom: ${props => props.active ? '2px solid #5ECE7B' : 'none'};
  
  &:hover {
    color: #5ECE7B;
  }
`;

const CartButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  position: relative;
`;

const CartCount = styled.span`
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #1D1F22;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
`;

const Overlay = styled.div`
  position: fixed;
  top: 80px;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1;
  display: ${props => props.visible ? 'block' : 'none'};
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #5ECE7B;
`;

function Header() {
  const [cartOpen, setCartOpen] = useState(false);
  const { totalItems } = useContext(CartContext);
  const location = useLocation();
  const currentPath = location.pathname;
  
  const { loading, error, data } = useQuery(GET_CATEGORIES);
  
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading categories</p>;
  
  const categories = data?.categories || [];
  
  const toggleCart = () => {
    setCartOpen(!cartOpen);
  };
  
  return (
    <>
      <HeaderContainer>
        <NavContainer>
          {categories.map(category => (
            <NavLink 
              key={category.name}
              to={category.name === 'all' ? '/' : `/category/${category.name}`}
              active={
                (currentPath === '/' && category.name === 'all') || 
                currentPath === `/category/${category.name}`
              }
              data-testid={
                (currentPath === '/' && category.name === 'all') || 
                currentPath === `/category/${category.name}` 
                  ? 'active-category-link' 
                  : 'category-link'
              }
            >
              {category.name}
            </NavLink>
          ))}
        </NavContainer>
        
        <Logo>SCANDIWEB</Logo>
        
        <CartButton 
          onClick={toggleCart} 
          data-testid="cart-btn"
        >
          🛒
          {totalItems > 0 && <CartCount>{totalItems}</CartCount>}
        </CartButton>
      </HeaderContainer>
      
      {cartOpen && <CartOverlay onClose={() => setCartOpen(false)} />}
      <Overlay visible={cartOpen} onClick={() => setCartOpen(false)} />
    </>
  );
}

export default Header;
