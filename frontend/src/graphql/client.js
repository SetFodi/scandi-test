// frontend/src/graphql/client.js
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://scandi-test-production.up.railway.app' // Absolute URL, no port
  }),
  cache: new InMemoryCache()
});

export default client;
