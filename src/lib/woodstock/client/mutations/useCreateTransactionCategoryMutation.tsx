import { gql, useMutation } from "@apollo/client";
import { TransactionCategory } from "../types";
import { useCallback } from "react";

export type CreateTransactionCategoryRequestType = {
	name: string,
}

var CREATE_TRANSACTION_CATEGORY_MUTATION = gql`
	mutation CreateTransactionCategory($name: String!) {
		createTransactionCategory(input: {
			name: $name
		}) {
			name,
			id,
			publicId
		}
	}
`;

type CreateTransactionCategoryResponseType = {
  createTransactionCategory: TransactionCategory,
}

function useCreateTransactionCategoryMutation() {
	const [mutateFunction] = useMutation<CreateTransactionCategoryResponseType>(CREATE_TRANSACTION_CATEGORY_MUTATION);

	const createTransaction = useCallback((request: CreateTransactionCategoryRequestType) => {
		mutateFunction({ variables: request });
	}, [mutateFunction]);

	return createTransaction;
}

export { useCreateTransactionCategoryMutation };
