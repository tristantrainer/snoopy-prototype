import {
	HubConnection,
	IHttpConnectionOptions,
	LogLevel,
	ILogger,
	HttpTransportType,
	IHubProtocol,
	IRetryPolicy
} from "@microsoft/signalr";
  
export interface Options {
	onConnected?: (hub: HubConnection) => void;
	onDisconnected?: (error?: Error) => void;
	onReconnecting?: (error?: Error) => void;
	onReconnected?: (connectionId?: string) => void;
	onError?: (error?: Error) => void;
	enabled?: boolean;
	automaticReconnect?: number[] | IRetryPolicy | boolean;
	httpTransportTypeOrOptions?: IHttpConnectionOptions | HttpTransportType;
	hubProtocol?: IHubProtocol;
	logging?: LogLevel | string | ILogger;
}

const DEFAULTS: Options = {
  enabled: true
};

export let defaultOptions: Options = DEFAULTS;

export const setDefaults = (options: Options) => {
  defaultOptions = {
    ...DEFAULTS,
    ...options
  };
};

export interface HubOptions<TMessageType> {
	messageName: string,
	onDisconnected?: (error?: Error) => void;
	onReconnecting?: (error?: Error) => void;
	onReconnected?: (connectionId?: string) => void;
	onError?: (error?: Error) => void;
	enabled?: boolean;
	automaticReconnect?: number[] | IRetryPolicy | boolean;
	httpTransportTypeOrOptions?: IHttpConnectionOptions | HttpTransportType;
	hubProtocol?: IHubProtocol;
	logging?: LogLevel | string | ILogger;
}

const HUB_DEFAULTS: Partial<HubOptions<any>> = {
  enabled: true
};

export let defaultHubOptions: Partial<HubOptions<any>> = HUB_DEFAULTS;

export type CacheUpdateMessageType = {
	entity: 'ACCOUNT' | "TRANSACTION" | "TRANSACTIONCATEGORY",
	type: 'CREATE' | 'UPDATE' | 'DELETE',
	id: string,
}

export type HubConnectionOption = {
    name: 'CACHE_UPDATES',
    callback: HubSubscriptionCallbackType<CacheUpdateMessageType>
} | {
    name: 'MESSAGE',
    callback: HubSubscriptionCallbackType<{ id: number }>
}

export type HubConnectionCallback = HubConnectionOption['callback']
export type HubConnectionNames = HubConnectionOption['name'];
export type HubSubscriptionCallbackType<T> = (message: T) => void;

export type HubConnectionType<TCallback> = {
    subscribe: (callback: TCallback) => void,
    unsubscribe: (callback: TCallback) => void,
    close: () => void,
}

export type HubConnectionsType<T> = Record<HubConnectionNames, HubConnectionType<T>>

export type HubConnectionInfoType = {
	url: string,
	name: HubConnectionNames,
	message: string,
}
