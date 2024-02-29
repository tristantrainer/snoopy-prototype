import { DocumentNode, useQuery } from "@apollo/client"
import { useCallback, useMemo, useRef } from "react";
import { FilterVariables, PageInfo, PagingVariables, QueryOptions, QueryResponse, QueryVariables } from "../types";

function isPagingVariables<TVariables extends object>(variables?: TVariables): variables is TVariables & PagingVariables {
	return variables ? 'pageSize' in variables && 'cursor' in variables : false;
}

function isFilterVariables<TVariables extends object, TFilters>(variables: TVariables): variables is TVariables & FilterVariables<TFilters> {
	return 'where' in variables;
}

export function useWoodstockQuery<TData, TFilters, TVariables extends QueryVariables<TFilters> = {}>(
	query: DocumentNode,
	options: QueryOptions<TData, TVariables, TFilters>
): QueryResponse<TData, TVariables, TFilters> {
	const { 
		data, 
		loading, 
		error, 
		refetch, 
		fetchMore,
	} = useQuery<TData, TVariables>(query, { variables: options.variables });

	const variables = useVariables(options.variables);

	const pageInfo = usePageInfo(options, data);

	const { 
		loadNextPage, 
		refetchAll 
	} = usePaging(pageInfo, fetchMore, refetch, variables);

	const {
		filter
	} = useFiltering(refetchAll, variables);


	// TODO: Find a way to memoise refetchAll, filter and loadNextPage (possibly practically impossible since variables change frequently)
	return { 
		data, 
		loading, 
		error, 
		hasNextPage: pageInfo.hasNextPage, 
		loadNextPage, 
		refetch: refetchAll, 
		filter 
	} as QueryResponse<TData, TVariables, TFilters>;
}

function useVariables<TVariables>(initial?: TVariables) {
	const variables = useRef(initial);
  
	const get = useCallback(() => variables.current, []);
	const update = useCallback((updates: Partial<TVariables>) => {
	  if(!variables.current) {
		return;
	  }
  
	  variables.current = {
		...variables.current,
		...updates,
	  }
	}, []);
  
	return {
	  get,
	  update,
	}
}

type useVariablesType = ReturnType<typeof useVariables>;

function usePageInfo<TData, TVariables, TFilters>(options: QueryOptions<TData, TVariables, TFilters>, data?: TData) {
	return (options.pageInfoSelector ? options.pageInfoSelector(data) : null) 
		?? { hasNextPage: false, endCursor: null };
}

function usePaging<TVariables>(pageInfo: PageInfo, fetchMore: (options: { variables: Partial<TVariables> }) => void, refetch: (variables?: Partial<TVariables>) => void, { get: getVariables}: useVariablesType) {
  const variables = getVariables();  
  const usePaging = variables && isPagingVariables(variables);

	const page = useRef(1);
	const pageSize = useMemo(() => usePaging ? variables.pageSize : 0 , []);

	if(!usePaging) {
		return {
			loadNextPage: () => {},
			refetchAll: () => refetch(),
		}
	}

	return {
		loadNextPage: () => {
			if(pageInfo.hasNextPage) {
				fetchMore({ 
					variables: { 
						...variables, 
						cursor: pageInfo.endCursor, 
						pageSize 
				  } as unknown as Partial<TVariables>
        });
				page.current += 1;
			} 
		},
		refetchAll: (overrides?: Partial<TVariables>) => { 
			refetch({ ...variables, ...overrides, pageSize: page.current * pageSize }) 
		}
	}
}

function useFiltering<TVariables extends object, TFilters>(refetch: (variables: Partial<TVariables>) => void, variables?: TVariables) {
	if(!variables || !isFilterVariables<TVariables, TFilters>(variables)) {
		return {
			filter: () => {}
		}
	}

	return {
		filter: (filters: Partial<TFilters>) => {
			refetch({ ...variables, where: { ...variables.where, ...filters } });
		}
	}
}