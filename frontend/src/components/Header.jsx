import React, { useContext } from 'react';
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
  position: fixed;
  top: 0;
  width: 100%;
  background: white;
  z-index: 10;
`;

const NavContainer = styled.nav`
  display: flex;
  gap: 1rem;
`;

const NavLink = styled(Link)`
  text-decoration: none;
  color: #1d1f22;
  padding: 0.5rem 1rem;
  text-transform: uppercase;
  font-weight: ${props => (props.active ? 'bold' : 'normal')};
  border-bottom: ${props => (props.active ? '2px solid #5ece7b' : 'none')};
  &:hover {
    color: #5ece7b;
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
  background-color: #1d1f22;
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
  display: ${props => (props.visible ? 'block' : 'none')};
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #5ece7b;
`;

function Header() {
  // Use cart context state instead of local state
  const { totalItems, isCartOpen, setIsCartOpen } = useContext(CartContext);
  const location = useLocation();
  const currentPath = location.pathname;

  const { loading, error, data } = useQuery(GET_CATEGORIES);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading categories</p>;

  const categories = data?.categories || [];
  const categoryPaths = categories.map(cat => `/${cat.name}`);

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  return (
    <>
      <HeaderContainer>
        <NavContainer>
          {categories.map(category => (
            <NavLink
              key={category.name}
              to={`/${category.name}`}
              active={currentPath === `/${category.name}`}
              data-testid={
                currentPath === `/${category.name}`
                  ? 'active-category-link'
                  : 'category-link'
              }
            >
              {category.name}
            </NavLink>
          ))}
        </NavContainer>
        <Logo>SCANDIWEB</Logo>
        <CartButton onClick={toggleCart} data-testid="cart-btn">
          🛒
          {totalItems > 0 && <CartCount>{totalItems}</CartCount>}
        </CartButton>
      </HeaderContainer>
      {isCartOpen && <CartOverlay onClose={() => setIsCartOpen(false)} />}
      <Overlay visible={isCartOpen} onClick={() => setIsCartOpen(false)} />
    </>
  );
}

export default Header;

