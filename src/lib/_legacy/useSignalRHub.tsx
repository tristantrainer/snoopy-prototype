'use client';

import { useState, useEffect, useRef, createContext, ReactNode, useCallback, useContext } from "react";
import {
  HubConnectionBuilder,
  HubConnection,
  HubConnectionState
} from "@microsoft/signalr";

import { HubOptions } from "./types";

export type BackgroundTaskHubMessageType = {
  taskId: string,
}

type HubType<TMessageType> = {
  subscribe: (callback: (message: TMessageType) => void) => void,
  unsubscribe: (callback: (message: TMessageType) => void) => void,
  connection: HubConnection,
  close: () => void,
}

type HubListType = {
  cacheUpdates?: HubType<BackgroundTaskHubMessageType>
}

function createConnection<THubMessageType>(hubUrl: string, options: HubOptions<THubMessageType>): HubType<THubMessageType> {
  let isCanceled = false;

  const subscribers = new Set<(message: THubMessageType) => void>();

  const subscribe = (callback: (message: THubMessageType) => void) => {
    subscribers.add(callback);
  }

  const unsubscribe = (callback: (message: THubMessageType) => void) => {
    subscribers.delete(callback);
  }

  const notify = (message: THubMessageType) => {
    subscribers.forEach((callback) => callback(message));
  }

  const hubConnectionSetup = new HubConnectionBuilder();

  if(options.httpTransportTypeOrOptions)
    // @ts-expect-error: We don't need to adhere to the overloads. https://github.com/microsoft/TypeScript/issues/14107
    hubConnectionSetup.withUrl(hubUrl, options.current.httpTransportTypeOrOptions);
  else
    hubConnectionSetup.withUrl(hubUrl);

  if(options.automaticReconnect) {
    if(options.automaticReconnect === true)
      hubConnectionSetup.withAutomaticReconnect();
    else
      // @ts-expect-error: We don't need to adhere to the overloads. https://github.com/microsoft/TypeScript/issues/14107
      hubConnectionSetup.withAutomaticReconnect(options.current.automaticReconnect);
  }

  if(options.logging)
    hubConnectionSetup.configureLogging(options.logging);

  if(options.hubProtocol)
    hubConnectionSetup.withHubProtocol(options.hubProtocol);

  const hubConnection = hubConnectionSetup.build();

  hubConnection.start()
    .then(() => {
      if(isCanceled)
        return hubConnection.stop();

      hubConnection.on(options.messageName, notify)

      if(options.onDisconnected)
        hubConnection.onclose(options.onDisconnected);

      if(options.onReconnecting)
        hubConnection.onreconnecting(options.onReconnecting);

      if(options.onReconnected)
        hubConnection.onreconnected(options.onReconnected);
    })
    .catch((error) => {
      if(isCanceled)
        return;

      if(options.onError)
        options.onError(error);
    });

  return {
    connection: hubConnection,
    subscribe,
    unsubscribe,
    close: () => hubConnection.stop(),
  }
}

function HubCache() {
  const hubs = useRef<HubListType>({});

  useEffect(() => () => { hubs.current.cacheUpdates?.close(); }, []);

  const subscribeToCacheUpdates = useCallback((callback: (message: BackgroundTaskHubMessageType) => void) => {
    if(!hubs.current.cacheUpdates) {
      hubs.current.cacheUpdates = createConnection('http://localhost:5000/cache-updates', {
        messageName: "CacheUpdated",
        onError: console.error,
        onDisconnected: console.error 
      });
    }

    hubs.current.cacheUpdates.subscribe(callback);

    return () => hubs.current.cacheUpdates?.unsubscribe(callback);
  }, []);

  return {
    subscribeToCacheUpdates
  }
}

type HubCacheType = ReturnType<typeof HubCache>;

const HubContext = createContext<HubCacheType | null>(null);

export function HubCacheProvider({ children }: { children: ReactNode }) {
  return (
    <HubContext.Provider value={HubCache()}>
      {children}
    </HubContext.Provider>
  );
}

export function useHubContext() {
  const hubs = useContext(HubContext);

  if(!hubs)
    throw new Error("Could not find hub context in parents");

  return hubs;
}

export function useCacheUpdatesSubscription() {
  const hubs = useHubContext();

	const [state, setState] = useState<BackgroundTaskHubMessageType>({ taskId: "" });

	useEffect(() => {
		return hubs.subscribeToCacheUpdates((message) => { setState(message); })
	}, []);
	
	return state;
}