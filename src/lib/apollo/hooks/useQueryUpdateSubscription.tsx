"use client"

import { HubConnectionBuilder } from "@microsoft/signalr";
import { DependencyList, ReactNode, createContext, useCallback, useContext, useEffect, useRef } from "react"
import { z } from "zod"

type ConnectionStore = {
	CACHE_UPDATES: WoodstockSubscription<CacheMessageType>,
	MESSAGE: WoodstockSubscription<{ name: number }>
}

type MessageType<T extends WoodstockSubscription<any>> = T extends WoodstockSubscription<infer TMessageType> ? TMessageType : never;

export const CacheUpdatesMessageSchema = z.object({
  id: z.string().uuid(),
	type: z.enum(["CREATE", 'UPDATE', 'DELETE']),
	entity: z.enum(['ACCOUNT', 'TRANSACTION', 'TRANSACTIONCATEGORY'])
});

type CacheMessageType = z.infer<typeof CacheUpdatesMessageSchema>;

export type SubscriptionType<TKey, TMessage> = {
    name: TKey,
    schema: z.Schema<TMessage>,
    callback: (message: TMessage) => void,
}

type SubscriptionCallback<TMessage> = (message: TMessage) => void;

type WoodstockSubscription<TMessage> = {
    subscribe: (callback: SubscriptionCallback<TMessage>) => void,
    unsubscribe: (callback: SubscriptionCallback<TMessage>) => void 
}

const HubConnectionOptions = {
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

function getSubscriptionSore<TKey extends keyof ConnectionStore>(name: TKey, store: Partial<ConnectionStore>): WoodstockSubscription<MessageType<ConnectionStore[TKey]>> {
	return store[name] as WoodstockSubscription<MessageType<ConnectionStore[TKey]>>;
}

function createConnectionCache() {
    const subscriptions = useRef<Partial<ConnectionStore>>({});

    const subscribe = useCallback(<TKey extends keyof ConnectionStore, TMessage extends MessageType<ConnectionStore[TKey]>>(subscription: SubscriptionType<TKey, TMessage>) => {
			if(!subscriptions.current[subscription.name]) {
				subscriptions.current[subscription.name] = createConnection<TMessage>(subscription.name) as ConnectionStore[TKey];
			}

			const service = getSubscriptionSore(subscription.name, subscriptions.current) ;

			const callback = subscription.callback as SubscriptionCallback<MessageType<ConnectionStore[TKey]>>;

			service.subscribe(callback);

			return () => service.unsubscribe(callback);
    }, []);

	return {
		subscribe
	}
}

function createMockConnectionCache(): WoodstockConnectionCacheType {
	return {
		subscribe: <TKey extends keyof ConnectionStore, TMessage extends MessageType<ConnectionStore[TKey]>>(_: SubscriptionType<TKey, TMessage>) => () => {}
	}
}

type WoodstockConnectionCacheType = ReturnType<typeof createConnectionCache>

const WoodstockConnectionCacheContext = createContext<WoodstockConnectionCacheType | null>(null);

export function WoodstockSubscriptionProvider({ children }: { children: ReactNode }) {
    return (
        <WoodstockConnectionCacheContext.Provider value={createConnectionCache()}>
            {children}
        </WoodstockConnectionCacheContext.Provider>
    )
}

export function MockWoodstockSubscriptionProvider({ children }: { children: ReactNode }) {
    return (
        <WoodstockConnectionCacheContext.Provider value={createMockConnectionCache()}>
            {children}
        </WoodstockConnectionCacheContext.Provider>
    )
}

export function useWoodstockSubscription<TKey extends keyof ConnectionStore, TMessage extends MessageType<ConnectionStore[TKey]>>(subscription: SubscriptionType<TKey, TMessage>, deps: DependencyList) {
	const connections = useContext(WoodstockConnectionCacheContext);

	if(!connections)
		throw Error("Woodstock connection context not found in parents");

	useEffect(() => { return connections.subscribe(subscription) }, deps);
}

function createConnection<TMessage>(name: keyof typeof HubConnectionOptions): WoodstockSubscription<TMessage> {
	const options = HubConnectionOptions[name];

	let isCanceled = false;

	const subscribers = new Set<SubscriptionCallback<TMessage>>();

	const subscribe = (callback: SubscriptionCallback<TMessage>) => {
		subscribers.add(callback);
	}

	const unsubscribe = (callback: SubscriptionCallback<TMessage>) => {
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
		.catch((_) => {
			if(isCanceled)
				return;
		});

	return {
		subscribe,
		unsubscribe,
	} 
}

