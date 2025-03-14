// frontend/src/graphql/mutations.js
import { gql } from '@apollo/client';

export const PLACE_ORDER = gql`
  mutation PlaceOrder($products: [OrderProductInput!]!) {
    placeOrder(products: $products) {
      id
      total
    }
  }
`;
