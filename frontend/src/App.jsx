import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import client from './graphql/client';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import CategoryPage from './pages/CategoryPage';
import ProductPage from './pages/ProductPage';
import './App.css';

function App() {
  return (
    <ApolloProvider client={client}>
      <CartProvider>
        <Router>
          <Header />
          <main style={{ paddingTop: '80px' }}>
            <Routes>
              <Route path="/all" element={<CategoryPage categoryName="all" />} />
              <Route path="/clothes" element={<CategoryPage categoryName="clothes" />} />
              <Route path="/tech" element={<CategoryPage categoryName="tech" />} />
              <Route path="/product/:productId" element={<ProductPage />} />
              <Route path="/" element={<Navigate to="/all" />} />
            </Routes>
          </main>
        </Router>
      </CartProvider>
    </ApolloProvider>
  );
}

export default App;
