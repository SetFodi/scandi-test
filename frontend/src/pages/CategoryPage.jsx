// frontend/src/pages/CategoryPage.jsx

import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import styled from 'styled-components';
import { GET_PRODUCTS_BY_CATEGORY } from '../graphql/queries';
import ProductCard from '../components/ProductCard';

// Styled-components for layout and styling on this page.
const PageContainer = styled.div`
  padding: 2rem;
`;

const CategoryTitle = styled.h1`
  font-weight: 400;
  font-size: 2.625rem;
  margin-bottom: 2rem;
  text-transform: capitalize;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(386px, 1fr));
  gap: 2.5rem;
`;

// The CategoryPage component fetches data based on the category name
// (derived from the URL parameters or a prop) and renders the list.
function CategoryPage({ categoryName: propCategoryName }) {
  // Read the category name from URL parameters.
  const { categoryName: paramCategoryName } = useParams();
  // Determine the active category (defaulting to "all").
  const categoryName = paramCategoryName || propCategoryName || 'all';
  
  // Execute the GraphQL query to fetch products, passing the category name.
  const { loading, error, data } = useQuery(GET_PRODUCTS_BY_CATEGORY, {
    variables: { categoryName }
  });

  // Show loading state.
  if (loading) return <p>Loading...</p>;
  // Show error message if the data fetching fails.
  if (error) return <p>Error loading products: {error.message}</p>;
  
  // Extract products from the query result.
  const products = data?.products || [];
  
  return (
    <PageContainer>
      <CategoryTitle>{categoryName}</CategoryTitle>
      <ProductGrid>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </ProductGrid>
    </PageContainer>
  );
}

export default CategoryPage;
