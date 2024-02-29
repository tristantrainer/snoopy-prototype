'use client';

import { HubConnectionBuilder } from "@microsoft/signalr/dist/esm/HubConnectionBuilder";
import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { HubConnectionInfoType, HubConnectionNames, HubConnectionOption } from "./types";

export type CacheUpdateMessageType = {
	entity: 'ACCOUNT' | "TRANSACTION" | "TRANSACTIONCATEGORY",
	type: 'CREATE' | 'UPDATE' | 'DELETE',
	id: string,
}

type HubMessageCallback<TMessage> = (message: TMessage) => void;

const HubConnectionOptions: Record<HubConnectionNames, HubConnectionInfoType>  = {
	CACHE_UPDATES: {
		url: 'https://localhost:7251/cache-updates',
		name: 'CACHE_UPDATES',
		message: 'CacheUpdated',
	},
	MESSAGE: {
		url: 'https://localhost:7251/message',
		name: 'MESSAGE',
		message: 'MessageRecieved'
	}
};

type HubConnections = {
    CACHE_UPDATES: HubConnectionType<HubMessageCallback<CacheUpdateMessageType>>,
    MESSAGE: HubConnectionType<HubMessageCallback<{ id: number }>>,
}

export type HubMessageTypes = {
    CACHE_UPDATES: CacheUpdateMessageType,
    MESSAGE: { id: number }
}

type HubSubscriptionCallback<TMessage, TContext> = (message: TMessage, context?: TContext) => void;

export type HubConnection<TKey extends HubConnectionNames, TMessage extends HubMessageTypes[TKey], TContext = never> = {
	name: TKey,
	context?: TContext,
	callback: HubSubscriptionCallback<TMessage, TContext>,
}

export type HubConnectionType<TCallback> = {
    subscribe: (callback: TCallback) => void,
    unsubscribe: (callback: TCallback) => void,
    close: () => void,
}

function createConnection<TKey extends HubConnectionNames, TMessage extends HubMessageTypes[TKey], TContext>(hub: HubConnection<TKey, TMessage, TContext>): HubConnections[TKey] {
	const options = HubConnectionOptions[hub.name];

	let isCanceled = false;

	const subscribers = new Set<HubMessageCallback<TMessage>>();

	const subscribe = (callback: HubMessageCallback<TMessage>) => {
		subscribers.add(callback);
	}

	const unsubscribe = (callback: HubMessageCallback<TMessage>) => {
		subscribers.delete(callback);
	}

	const notify = (message: TMessage) => {
		subscribers.forEach((callback) => callback(message));
	}

	const hubConnectionSetup = new HubConnectionBuilder();

	hubConnectionSetup.withUrl(options.url);

	const hubConnection = hubConnectionSetup.build();

	hubConnection.start()
		.then(() => {
			if(isCanceled)
				return hubConnection.stop();

			hubConnection.on(options.message, notify)
		})
		.catch((error) => {
			if(isCanceled)
				return;
		});

	return {
		subscribe,
		unsubscribe,
		close: () => hubConnection.stop(),
	} as HubConnections[TKey]
}



function createHubConnectionCache() {
    const connections = useRef<Partial<HubConnections>>({ });

    const subscribe = useCallback(<TKey extends HubConnectionNames, TMessage extends HubMessageTypes[TKey], TContext>(hub: HubConnection<TKey, TMessage, TContext>) => {
        if(!connections.current[hub.name]) {
            connections.current[hub.name] = createConnection(hub);
        }

        const callback = (message: unknown) => hub.callback(message as TMessage, hub.context);

        connections.current[hub.name]?.subscribe(callback);

        return () => { 
            connections.current[hub.name]?.unsubscribe(callback);
        };
    }, []);

    return {
        subscribe,
    }
}

type HubConnectionCacheType = ReturnType<typeof createHubConnectionCache>

const HubConnectionCacheContext = createContext<HubConnectionCacheType | null>(null);

export function HubConnectionCacheProvider({ children }: { children: ReactNode }) {
    return (
        <HubConnectionCacheContext.Provider value={createHubConnectionCache()}>
            {children}
        </HubConnectionCacheContext.Provider>
    )
}

export function useHub() {
    const connections = useContext(HubConnectionCacheContext);

    if(!connections)
        throw new Error('Hub Connection Cache Provider not found in parent hierarchy');

    return connections;
}   