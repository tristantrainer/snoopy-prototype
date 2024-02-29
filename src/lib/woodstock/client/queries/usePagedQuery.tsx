"use client";

import { DocumentNode, useQuery } from "@apollo/client";
import { useCallback, useRef } from "react";

export type PagedQueryVariables = {
    pageSize: number,
    cursor: string | null
}

export type PageInfo = {
    endCursor: string | null,
    hasNextPage: boolean,
}

type PageInfoSelector<T> = (response?: T) => PageInfo | undefined

function usePagedQuery<TQueryResponse, TVariables extends PagedQueryVariables>(query: DocumentNode, variables: TVariables, pageInfoSelector: PageInfoSelector<TQueryResponse>) {
    const variablesRef = useRef(variables);
    const { data, loading, error, refetch, fetchMore } = useQuery<TQueryResponse, TVariables>(query, { variables });

    const pageCount = useRef(1);
    const pageInfo = pageInfoSelector(data);

    const loadNextPage = useCallback(() => {
        if(pageInfo?.hasNextPage) {
            fetchMore({ variables: { ...variablesRef.current, cursor: pageInfo?.endCursor }});
            pageCount.current += 1;
        }   
    }, [pageInfo, fetchMore]);

    const refresh = useCallback(() => {
        console.log("Refresh", variablesRef.current)
        refetch({ ...variablesRef.current, pageSize: pageCount.current * variablesRef.current.pageSize });
    }, [refetch]);

    const updateVariables = useCallback((variables: Partial<TVariables>) => {
        variablesRef.current = { ...variablesRef.current, ...variables } 
        refresh();
    }, [refresh])

    return {
        data,
        loading,
        error,
        hasNextPage: pageInfo?.hasNextPage ?? false,
        refresh,
        loadNextPage,
        updateVariables
    }
}

export { usePagedQuery };