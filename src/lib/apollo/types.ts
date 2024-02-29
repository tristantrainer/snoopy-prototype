import { z } from "zod";

export type PageInfo = {
    endCursor: string | null,
    hasNextPage: boolean,
}

export type QueryVariables<TFilters> = ({} | PagingResponse) & ({} | FilterResponse<TFilters>);

export type PagingVariables = { 
	pageSize: number,
	cursor: string | null,
}

export type FilterVariables<T> = {
	where: T | null;
};

export type BaseQueryResponse<TData, TVariables> = {
	data?: TData;
	loading: boolean;
	error?: {
		message: string;
	},
	refetch: (variables?: Partial<TVariables>) => void,
}

export type PagingResponse = {
	hasNextPage: boolean;
	loadNextPage: () => void;
};

export type FilterResponse<TFilters> = {
	filter: (filters: Partial<TFilters>) => void;
};

export type QueryResponse<TData, TVariables, TFilters> = BaseQueryResponse<TData, TVariables> 
	& (TVariables extends PagingVariables ? PagingResponse : {}) 
	& (TVariables extends FilterVariables<TFilters> ? FilterResponse<TFilters> : {});

export type FullQueryResponse<TData,TVariables, TFilters> = BaseQueryResponse<TData, TVariables> & PagingResponse & FilterResponse<TFilters>

export type QueryContext = {
	refetch: () => void,
}

export type QueryOptions<TData, TVariables, TFilters> = { 
	schema: z.Schema<TData>,
	filterSchema?: z.Schema<TFilters>
	variables?: TVariables,
	pageInfoSelector?: (data?: TData) => PageInfo | undefined,
}
