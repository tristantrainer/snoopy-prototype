import { HubConnectionBuilder } from "@microsoft/signalr";
import { useCallback, useRef } from "react";
import { z } from "zod";

export type SubscriptionCallback<TMessage> = (message: TMessage) => void;

const HubConnectionOptions = {
	CACHE_UPDATES: {
		url: 'https://localhost:7251/cache-updates',
		name: 'CACHE_UPDATES',
		messageId: 'CacheUpdated',
		schema: z.object({
			id: z.string().uuid(),
			type: z.enum(["CREATE", 'UPDATE', 'DELETE']),
			entity: z.enum(['ACCOUNT', 'TRANSACTION', 'TRANSACTIONCATEGORY'])
		})
	},
	MESSAGE: {
		url: 'https://localhost:7251/message',
		name: 'MESSAGE',
		messageId: 'MessageRecieved',
		schema: z.object({
			id: z.string().uuid(),
		}),
	}
};


export type SubscriptionConnection<TMessage> = {
    subscribe: (callback: SubscriptionCallback<TMessage>) => void,
    unsubscribe: (callback: SubscriptionCallback<TMessage>) => void,
}

export type SubscriptionOptions<TMessage> = {
    url: string,
    name: string,
    messageId: string,
    schema: z.Schema<TMessage>
}

export function createConnection<TMessage>(options: SubscriptionOptions<TMessage>): SubscriptionConnection<TMessage> {
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

			hubConnection.on(options.messageId, notify)
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

