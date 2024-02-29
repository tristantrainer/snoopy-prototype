import { useEffect, useRef } from "react"
import { z } from "zod"

type SubscriptionsStore = {
    CACHE_UPDATES: SubscriptionService<CacheMessageType>,
    OTHER_UPDATE: SubscriptionService<{ name: number }>
}

type MessageType<T extends SubscriptionService<any>> = T extends SubscriptionService<infer TMessageType> ? TMessageType: never;

type CacheMessageType = {
    id: string //"ENTITY" | "OTHER"
}

type QueryContext = {
    refetch: () => void,
}

type SubscriptionType<TKey, TMessage> = {
    name: TKey,
    schema: z.Schema<TMessage>,
    callback: (message: TMessage, context: QueryContext) => void,
}

type SubscriptionQuery<TKey, TMessage> = {
    subscription: SubscriptionType<TKey, TMessage>
}

type SubscriptionCallback<TMessage> = (message: TMessage) => void;

type SubscriptionService<TMessage> = {
    subscribe: (callback: SubscriptionCallback<TMessage>) => void,
    unsubscribe: (callback: SubscriptionCallback<TMessage>) => void 
}

function getSubscriptionSore<TKey extends keyof SubscriptionsStore>(name: TKey, store: Partial<SubscriptionsStore>): SubscriptionService<MessageType<SubscriptionsStore[TKey]>> {
    return store[name] as SubscriptionService<MessageType<SubscriptionsStore[TKey]>>;
}

function query<TKey extends keyof SubscriptionsStore, TMessage extends MessageType<SubscriptionsStore[TKey]>>(query: SubscriptionQuery<TKey, TMessage>) {
    useSubscription(query.subscription);
}

function useSubscription<TKey extends keyof SubscriptionsStore, TMessage extends MessageType<SubscriptionsStore[TKey]>>(subscription: SubscriptionType<TKey, TMessage>) {
    const subscriptions = useRef<Partial<SubscriptionsStore>>({});

    useEffect(() => {
        if(!subscriptions.current[subscription.name]) {
            subscriptions.current[subscription.name] = createService<TMessage>() as SubscriptionsStore[TKey];
        }

        const service = getSubscriptionSore(subscription.name, subscriptions.current) ;

        const callback = ((message: TMessage) => subscription.callback(message, { refetch: () => {}})) as SubscriptionCallback<MessageType<SubscriptionsStore[TKey]>>;

        service.subscribe(callback);

        return () => service.unsubscribe(callback);
    }, []);
}

function createService<TMessage>(): SubscriptionService<TMessage> {
    return {
        subscribe: (callback: SubscriptionCallback<TMessage>) => { console.log("Subscribed") },
        unsubscribe: (callback: SubscriptionCallback<TMessage>) => { console.log("Unsubscribed") } 
    }
}

const cacheUpdatesSchema = z.object({
    id: z.string(),
});

function usage() {
    query({
        subscription: {
            name: "CACHE_UPDATES",
            schema: cacheUpdatesSchema,
            callback: (message, context) => {
                if(message.id === "ENTITY") {
                    context.refetch();
                }
            }
        }
    })
}




























// import { useCallback, useRef } from "react"

// type MessageOne = { id: number }
// type MessageTwo = { name: string }

// type MessageTypes = {
//     SUBSCRIPTION_ONE: MessageOne,
//     SUBSCRIPTION_TWO: MessageTwo
// }

// type SubscriptionCallback<TMessage> = (message: TMessage) => void;

// type SubscriptionService<TMessage> = {
//     subscribe: (callback: SubscriptionCallback<TMessage>) => void,
//     // unsubscribe: (callback: SubscriptionCallback<TMessage>) => void
// }

// type SubscriptionStore = {
//     SUBSCRIPTION_ONE: SubscriptionService<MessageOne>,
//     SUBSCRIPTION_TWO: SubscriptionService<MessageTwo>,
// }

// function createSubscriptionService<TKey extends keyof MessageTypes, TMessage extends MessageTypes[TKey]>(): SubscriptionStore[TKey] {
//     return {
//         subscribe: (callback: SubscriptionCallback<TMessage>) => { /* Code left out for berevity */ },
//         unsubscribe: (callback: SubscriptionCallback<TMessage>) => { /* Code left out for berevity */ },
//     } as SubscriptionStore[TKey]
// }


// function createStore() {
//     const store = useRef<Partial<SubscriptionStore>>({});

//     const subscribe = useCallback(<
//         TKey extends keyof SubscriptionStore, 
//         TMessage extends MessageTypes[TKey]
//     >(name: TKey, callback: SubscriptionCallback<TMessage>) => {
//         if(!store.current[name]) {
//             store.current[name] = createSubscriptionService<TKey, TMessage>();
//         }

//         store.current[name]?.subscribe(callback);

//        // return () => store.current[name]?.unsubscribe(callback);
//     }, []);

//     return {
//         subscribe,
//     }
// }