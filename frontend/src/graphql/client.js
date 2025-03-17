// frontend/src/graphql/client.js
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const client = new ApolloClient({
  link: new HttpLink({
    uri: 'scandi-test-production.up.railway.app' // Root URL, no /graphql
  }),
  cache: new InMemoryCache()
});

export default client;
