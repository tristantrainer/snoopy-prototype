import { DocumentNode, OperationVariables, useQuery } from "@apollo/client";
import { useCallback, useMemo, useRef } from "react";
import { z } from "zod";

type PagingVariables = {
	pageSize: number,
	cursor: string | null
}

type FilteringVariables<TFilters> = {
    where: TFilters | null
}

type PagingOptions<TData> = {
	variables: PagingVariables, 
	paging: {
		pageInfoSelector: (data?: TData) => PageInfo | null | undefined
	}
}

type FilterOptions<TFilters> = {
	variables: FilteringVariables<TFilters>,
	filtering: {
		schema: z.Schema<TFilters>
	}
}

type PageInfo = z.infer<typeof PageInfoSchema>

type QueryOptions<TData, TVariables extends OperationVariables = OperationVariables, TFilters = never> = {
	schema: z.Schema<TData>,
	variables?: TVariables,
} 
	& ( TVariables extends PagingVariables ? PagingOptions<TData> : {} )
	& ( TVariables extends FilteringVariables<TFilters> ? FilterOptions<TFilters> : {} );

function isPagedQuery<TData, TVariables extends OperationVariables, TFilters>(options?: QueryOptions<TData, TVariables, TFilters>): options is QueryOptions<TData, TVariables, TFilters> & PagingOptions<TData> {
	return options 
		? (
			"variables" in options 
			&& !!options.variables
			&& "pageSize" in options.variables 
			&& "cursor" in options.variables 
			&& "paging" in options 
		)
		: false;
}

function isPagingVariables<TVariables extends OperationVariables>(variables: TVariables | null): variables is TVariables & PagingVariables {
	return variables ? ('pageSize' in variables && 'cursor' in variables) : false;
}

function isFilterVariables<TVariables extends OperationVariables, TFilters>(variables?: TVariables): variables is TVariables & FilteringVariables<TFilters> {
	return variables ? 'where' in variables : false;
}

type PagingResponse = {
	loadNextPage: () => void,
}

type FilterResponse<TFilters> = {
	filter: (filters: Partial<TFilters>) => void,
}

type QueryResponse<TData, TVariables extends OperationVariables, TFilters> = {
	data: TData,
	loading: boolean,
	error?: string,
	refetch: () => void, 
} 
& ( TVariables extends PagingVariables ? PagingResponse : {} )
& ( TVariables extends FilteringVariables<TFilters> ? FilterResponse<TFilters> : {} );

type GetVariablesType<TVariables> = () => TVariables | null;
type UpdateFiltersType<TFilters> = (filters: TFilters) => void;

export function useCustomQuery<TData, TVariables extends OperationVariables = OperationVariables, TFilters = never>(query: DocumentNode, options?: QueryOptions<TData, TVariables, TFilters>) {
	const { 
		data, 
		loading, 
		error, 
		fetchMore, 
		refetch 
	} = useQuery(query, { variables: options?.variables });

	const apolloFetchMore = useCallback((variables: Partial<TVariables>) => {
		fetchMore({ variables });
	}, [fetchMore])

	const {
		getVariables,
		updateFilters,
	} = useVariables(options?.variables);

	const {
		refetchAll,
		loadNextPage,
	} = usePaging(apolloFetchMore, refetch, getVariables, data, options);

	const { 
		filter 
	} = useFiltering(refetchAll, updateFilters);

	return {
		data,
		loading,
		error: error?.message,
		refetch: refetchAll,
		loadNextPage,
		filter,
	} as QueryResponse<TData, TVariables, TFilters>
}

function useVariables<TVariables extends OperationVariables>(initial?: TVariables) {
	const variables = useRef(initial);

	const getVariables = useCallback(() => variables.current ?? null, []);

	const updateFilters = useCallback(<TFilters,>(filters: TFilters) => {
		if(!isFilterVariables<TVariables, TFilters>(variables.current)) {
			return;
		}

		variables.current = { 
			...variables.current, 
			where: filters
		}
	}, []);
  
	return {
		getVariables,
		updateFilters
	}
}

function usePaging<TData, TVariables extends OperationVariables, TFilters>(
	fetchMore: (variables: Partial<TVariables>) => void, 
	refetch: (variables?: Partial<TVariables>) => void, 
	getVariables: GetVariablesType<TVariables>,
	data?: TData, 
	options?: QueryOptions<TData, TVariables, TFilters>
) {
	const page = useRef(1);
	const pageInfo = useMemo(() => (isPagedQuery(options) ? options.paging.pageInfoSelector(data) : null) ?? { endCursor: null, hasNextPage: false }, [data]);

  const loadNextPage = useCallback(() => {
		const variables = getVariables();

		if(isPagingVariables(variables) && pageInfo.hasNextPage) {
			page.current += 1;
      fetchMore({ ...variables, cursor: pageInfo.endCursor });
		}
  }, [getVariables, pageInfo, fetchMore]);

  const refetchAll = useCallback(() => {
		const variables = getVariables();

		if(isPagingVariables(variables)) {
      refetch({ ...variables, pageSize: Math.min(page.current * variables.pageSize, 50) });
		} else if(variables) {
			refetch({ ...variables });
		} else {
			refetch()
		}
  }, [getVariables, refetch]);

  return {
    loadNextPage,
    refetchAll,
  }
}

function useFiltering<TFilters>(
	refetchAll: () => void,
	updateFilters: UpdateFiltersType<TFilters>
) {
	const filter = useCallback((filters: TFilters) => {
		updateFilters(filters);
   	refetchAll();
  }, [updateFilters, refetchAll]);

	return {
		filter,
	}
}

function useQuerySubscription() {

}

const PageInfoSchema = z.object({
  endCursor: z.string().nullable(),
  hasNextPage: z.boolean(),
});
