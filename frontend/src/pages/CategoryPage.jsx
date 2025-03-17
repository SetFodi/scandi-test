import React from 'react';
import { useQuery } from '@apollo/client';
import styled from 'styled-components';
import { GET_PRODUCTS_BY_CATEGORY } from '../graphql/queries';
import ProductCard from '../components/ProductCard';

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

function CategoryPage({ categoryName }) {
  const { loading, error, data } = useQuery(GET_PRODUCTS_BY_CATEGORY, {
    variables: { categoryName },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading products: {error.message}</p>;

  const products = data?.products || [];

  return (
    <PageContainer>
      <CategoryTitle>{categoryName}</CategoryTitle>
      <ProductGrid>
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </ProductGrid>
    </PageContainer>
  );
}

export default CategoryPage;
