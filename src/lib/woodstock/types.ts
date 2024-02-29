import { z } from "zod";
import { HubConnection } from "../signalr/HubContext";
import { CacheUpdateMessageType } from "../signalr/types";

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

export type HubConnections<TContext> = HubConnection<"CACHE_UPDATES", CacheUpdateMessageType, TContext>;

export type QueryContext = {
	refetch: () => void,
}

export type QueryOptions<TData, TVariables, TFilters> = { 
	schema: z.Schema<TData>,
	variables?: TVariables,
} & ({} | { 
	filterSchema: z.Schema<TFilters>,
	variables: FilterVariables<TFilters>,
}) & ({} | {
	pageInfoSelector: (data?: TData) => PageInfo | undefined,
	variables: PagingVariables
})

type QueryUpdateSubscriptionCallbackType<TMessageType> = (message: TMessageType, refetch: () => void) => void;

export type QueryUpdateSubscription = {
    name: 'CACHE_UPDATES',
    callback: QueryUpdateSubscriptionCallbackType<CacheUpdateMessageType>,
} | {
    name: 'MESSAGE',
    callback: QueryUpdateSubscriptionCallbackType<{ id: number }>
}
