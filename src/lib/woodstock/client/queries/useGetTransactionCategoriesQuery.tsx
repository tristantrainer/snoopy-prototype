import { gql } from "@apollo/client";
import { CacheUpdateMessageType } from "@/lib/signalr/types";
import { useCallback, useMemo } from "react";
import { useWoodstockQuery } from "@/lib/apollo/hooks/useQuery";
import { z } from "zod";
import { CacheUpdatesMessageSchema, useWoodstockSubscription } from "@/lib/apollo/hooks/useQueryUpdateSubscription";

export type GetTransactionCategoriesVariablesType = {
    pageSize: number,
    cursor: string | null
}

var GET_TRANSACTION_CATEGORIES_QUERY = gql`
  query GetTransactionCategories {
    transactionCategories {
			name,
			id,
		}
  }
`;

const GetTransactionCategoriesSchema = z.object({
	transactionCategories: z.array(
		z.object({
			id: z.string().uuid(),
			name: z.string(),
		})
	)
});
  
export type GetTransactionCategoriesResponseType = z.infer<typeof GetTransactionCategoriesSchema>;

function useGetTransactionCategoriesQuery() {
	const { 
		data, 
		loading, 
		error, 
		refetch,
	} = useWoodstockQuery(GET_TRANSACTION_CATEGORIES_QUERY, {
		schema: GetTransactionCategoriesSchema,
	});
	
	useWoodstockSubscription({
    name: "CACHE_UPDATES",
    schema: CacheUpdatesMessageSchema,
    callback: (message) => {
      if(message.entity === "TRANSACTIONCATEGORY") {
        refetch();
      }
    }
  }, [refetch]);

	return {
		transactionCategories: data?.transactionCategories,
		loading,
		error,
	}
}

export { useGetTransactionCategoriesQuery };