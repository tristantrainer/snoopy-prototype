"use client";

import { DocumentNode, OperationVariables, useQuery as useApolloQuery } from "@apollo/client";
import { useCallback } from "react";

export type PagedQueryVariables<T> = T & {
    pageSize: number,
    cursor: string | null
} & OperationVariables;

export type PageInfo = {
    endCursor: string | null,
    hasNextPage: boolean,
}

type PageInfoSelector<T> = (response?: T) => PageInfo | undefined

function useQuery<TQueryResponse, TVariables>(query: DocumentNode, variables?: PagedQueryVariables<TVariables>) {
	const { 
		data, 
		loading, 
		error, 
		refetch 
	} = useApolloQuery<TQueryResponse>(query, { variables });

	return {
		data,
		loading,
		error,
		refresh: refetch,
	}
}

export { useQuery };