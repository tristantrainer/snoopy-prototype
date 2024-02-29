'use client';

import { HubConnectionBuilder } from "@microsoft/signalr/dist/esm/HubConnectionBuilder";
import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { CacheUpdateMessageType, HubConnectionCallback, HubConnectionInfoType, HubConnectionNames, HubConnectionOption, HubConnectionType, HubConnectionsType, HubSubscriptionCallbackType } from "./types";


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


function createConnection(hub: HubConnectionOption): HubConnectionType<typeof hub['callback']> {
	const options = HubConnectionOptions[hub.name];

	let isCanceled = false;

	const subscribers = new Set<typeof hub['callback']>();

	const subscribe = (callback: typeof hub['callback']) => {
		subscribers.add(callback);
	}

	const unsubscribe = (callback: typeof hub['callback']) => {
		subscribers.delete(callback);
	}

	const notify = (message: any) => {
		subscribers.forEach((callback) => callback(message));
	}

	const hubConnectionSetup = new HubConnectionBuilder();

	hubConnectionSetup.withUrl(options.url);

	// if(options.httpTransportTypeOrOptions)
	//   // @ts-expect-error: We don't need to adhere to the overloads. https://github.com/microsoft/TypeScript/issues/14107
	//   hubConnectionSetup.withUrl(hubUrl, options.current.httpTransportTypeOrOptions);
	// else
	//   hubConnectionSetup.withUrl(hubUrl);

	// if(options.automaticReconnect) {
	//   if(options.automaticReconnect === true)
	//     hubConnectionSetup.withAutomaticReconnect();
	//   else
	//     // @ts-expect-error: We don't need to adhere to the overloads. https://github.com/microsoft/TypeScript/issues/14107
	//     hubConnectionSetup.withAutomaticReconnect(options.current.automaticReconnect);
	// }

	// if(options.logging)
	//   hubConnectionSetup.configureLogging(options.logging);

	// if(options.hubProtocol)
	//   hubConnectionSetup.withHubProtocol(options.hubProtocol);

	const hubConnection = hubConnectionSetup.build();

	hubConnection.start()
		.then(() => {
			if(isCanceled)
				return hubConnection.stop();

			hubConnection.on(options.message, notify)

			// if(options.onDisconnected)
			//   hubConnection.onclose(options.onDisconnected);

			// if(options.onReconnecting)
			//   hubConnection.onreconnecting(options.onReconnecting);

			// if(options.onReconnected)
			//   hubConnection.onreconnected(options.onReconnected);
		})
		.catch((error) => {
			if(isCanceled)
				return;

			// if(options.onError)
			//   options.onError(error);
		});

	return {
		subscribe,
		unsubscribe,
		close: () => hubConnection.stop(),
	}
}



function createHubConnectionCache() {
    const connections = useRef<Partial<HubConnectionsType<HubConnectionCallback>>>({ });

    const subscribe = useCallback((hub: HubConnectionOption) => {
        if(!connections.current[hub.name]) {
            connections.current[hub.name] = createConnection(hub);
        }

        connections.current[hub.name]?.subscribe(hub.callback);

        return () => { 
            connections.current[hub.name]?.unsubscribe(hub.callback);
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

export function useSubscription() {
    const connections = useContext(HubConnectionCacheContext);

    if(!connections)
        throw new Error('Hub Connection Cache Provider not found in parent hierarchy');

    return connections;
}

export function useHubSubscription(hub: HubConnectionOption) {
    const connections = useContext(HubConnectionCacheContext);

    if(!connections)
        throw new Error('Hub Connection Cache Provider not found in parent hierarchy');

    useEffect(() => connections.subscribe(hub), [hub]);
}

export function useCacheUpdatesSubscription(callback: HubSubscriptionCallbackType<CacheUpdateMessageType>) {
    const hubOption = useMemo(() => {
        return { 
            name: 'CACHE_UPDATES', 
            callback,
        } as HubConnectionOption
    }, [callback]);

    useHubSubscription(hubOption);
}