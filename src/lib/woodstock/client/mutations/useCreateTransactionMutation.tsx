import { gql, useMutation } from "@apollo/client";
import { PagedQuery } from "../../models/PagedQuery";
import { Transaction } from "../types";
import { useCallback } from "react";

export type CreateTransactionRequestType = {
	description: string,
	date: string,
	value: number
}

var CREATE_TRANSACTION_MUTATION = gql`
	mutation CreateTransaction($description: String!, $value: Decimal!, $date: DateTime!, $categoryId: UUID!) {
		createTransaction(input: {
			description: $description,
			value: $value,
			date: $date,
			categoryId: $categoryId,
		}) {
			description,
			id,
			publicId
		}
	}
`;

type CreateTransactionResponseType = {
  createTransaction: Transaction,
}

function useCreateTransactionMutation() {
	const [mutateFunction] = useMutation<CreateTransactionResponseType>(CREATE_TRANSACTION_MUTATION);

	const createTransaction = useCallback((request: CreateTransactionRequestType) => {
		mutateFunction({ variables: request });
	}, [mutateFunction]);

	return createTransaction;
}

export { useCreateTransactionMutation };
