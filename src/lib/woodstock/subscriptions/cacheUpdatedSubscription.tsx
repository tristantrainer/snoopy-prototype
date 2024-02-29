'use client';

import { SubscriptionCallback, SubscriptionConnection, createConnection } from "@/lib/signalr/client";
import { DependencyList, ReactNode, createContext, useCallback, useContext, useEffect, useRef } from "react";
import { z } from "zod";

const CacheUpdatedMessageSchema = z.object({
    id: z.string().uuid(),
    type: z.enum(["CREATE", 'UPDATE', 'DELETE']),
    entity: z.enum(['ACCOUNT', 'TRANSACTION', 'TRANSACTIONCATEGORY'])
});

type CacheUpdatedMessage = z.infer<typeof CacheUpdatedMessageSchema>;

type CacheUpdatedSubscriptionConnection = SubscriptionConnection<CacheUpdatedMessage> | null;

type CacheUpdatedSubscriptionContextType = {
    subscribe: (callback: SubscriptionCallback<CacheUpdatedMessage>) => void,
} | null

const CacheUpdatedSubscriptionContext = createContext<CacheUpdatedSubscriptionContextType>(null);

const options = {
    url: 'https://localhost:7251/cache-updates',
    name: 'CACHE_UPDATES',
    messageId: 'CacheUpdated',
    schema: CacheUpdatedMessageSchema
}

function createCacheUpdatedSubscription() {
    const connection = useRef<CacheUpdatedSubscriptionConnection>(null);

    const subscribe = useCallback((callback: SubscriptionCallback<CacheUpdatedMessage>) => {
        if(!connection.current) {
            connection.current = createConnection(options)
        }

        connection.current.subscribe(callback)

        return () => connection.current?.unsubscribe(callback);
    }, []);

    return {
        subscribe
    }
}

export function CacheUpdatedSubscriptionProvider({ children }: { children: ReactNode }) {
    return (
        <CacheUpdatedSubscriptionContext.Provider value={createCacheUpdatedSubscription()}>
            {children}
        </CacheUpdatedSubscriptionContext.Provider>
    );
}

export function useCacheUpdatedSubscription(callback: SubscriptionCallback<CacheUpdatedMessage>, deps: DependencyList) {
    const context = useContext(CacheUpdatedSubscriptionContext);

    if(!context) {
        throw new Error("Failed to find cache update subscription context in parents");
    }

    useEffect(() => context.subscribe(callback), [deps]);
}