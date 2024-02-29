import { GetTransactionsResponseType } from '@/lib/woodstock/client/queries/useGetTransactionsQuery';
import { ApolloClient, InMemoryCache, ApolloLink, execute, Observable, ApolloProvider, Operation, NormalizedCacheObject } from '@apollo/client';
import { ReactNode } from 'react';

// Mock data
const mockData = {
  user: { id: '1', name: 'John Doe' },
  posts: [
    { id: '1', title: 'Post 1' },
    { id: '2', title: 'Post 2' },
  ],
};

function raise(message: string): never {
	throw new Error(message);
}

export function MockWoodstockGraphQLClientProvider({ client, children }: { client: ApolloClient<NormalizedCacheObject>, children: ReactNode }) {
  return (
		<ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
}

export function createMockClient<TData>(data: TData, responseSelector: (operation: Operation, data: TData) => Record<string, any>) {
	const link = new ApolloLink((operation, forward) => {
		return new Observable((observer) => {
			observer.next({ data: responseSelector(operation, data)});
			observer.complete();
		});
	});

	return new ApolloClient({
		cache: new InMemoryCache(),
		link,
	});
}