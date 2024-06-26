"use client";

import { ReactNode } from "react";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { relayStylePagination } from "@apollo/client/utilities";

const client = new ApolloClient({
  uri: 'http://localhost:5001/graphql',
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          accounts: relayStylePagination(),
          transactions: relayStylePagination(),
        }
      }
    }
  }),
});

export function WoodstockGraphQLClientProvider({ children }: { children: ReactNode }) {
    return (
        <ApolloProvider client={client}>
            {children}
        </ApolloProvider>
    );
}