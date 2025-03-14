// frontend/src/graphql/client.js
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const client = new ApolloClient({
  link: new HttpLink({
    uri: 'http://localhost:8000' // Ensure this matches your PHP server URL
  }),
  cache: new InMemoryCache()
});

export default client;
