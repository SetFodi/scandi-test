<?php
// backend/graphql/schema.php
// Define the GraphQL schema

$typeDefs = <<<'GRAPHQL'
type Query {
  categories: [Category]
  category(name: String!): Category
  products(categoryName: String): [Product]
  product(id: String!): Product
}

type Mutation {
  placeOrder(products: [OrderProductInput!]!): Order
}

type Order {
  id: ID!
  products: [OrderProduct!]!
  total: Float!
}

type OrderProduct {
  product: Product!
  quantity: Int!
  selectedAttributes: [SelectedAttribute!]!
}

input OrderProductInput {
  productId: String!
  quantity: Int!
  selectedAttributes: [SelectedAttributeInput!]!
}

input SelectedAttributeInput {
  id: String!
  value: String!
}

type SelectedAttribute {
  id: String!
  value: String!
}

type Category {
  name: String!
  products: [Product]
}

type Product {
  id: ID!
  name: String!
  inStock: Boolean!
  gallery: [String!]!
  description: String!
  category: String!
  attributes: [AttributeSet!]!
  prices: [Price!]!
  brand: String!
}

type AttributeSet {
  id: String!
  name: String!
  type: String!
  items: [Attribute!]!
}

type Attribute {
  displayValue: String!
  value: String!
  id: String!
}

type Price {
  amount: Float!
  currency: Currency!
}

type Currency {
  label: String!
  symbol: String!
}
GRAPHQL;

return $typeDefs;
