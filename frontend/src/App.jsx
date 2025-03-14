// frontend/src/App.jsx
import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
          <main>
            <Routes>
              <Route path="/" element={<CategoryPage categoryName="all" />} />
              <Route path="/category/:categoryName" element={<CategoryPage />} />
              <Route path="/product/:productId" element={<ProductPage />} />
            </Routes>
          </main>
        </Router>
      </CartProvider>
    </ApolloProvider>
  );
}

export default App;
