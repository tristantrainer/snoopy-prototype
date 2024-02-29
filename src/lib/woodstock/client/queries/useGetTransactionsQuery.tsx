import { gql } from "@apollo/client";
import { useWoodstockQuery } from "@/lib/apollo/hooks/useQuery";
import { CacheUpdatesMessageSchema, useWoodstockSubscription } from "@/lib/apollo/hooks/useQueryUpdateSubscription";
import { z } from "zod";

const GetTransactionsFiltersSchema = z.object({
  description: z.object({
    contains: z.string().optional(),
  }).optional()
}).nullable(); 

export type GetTransactionsVariablesType = {
  pageSize: number,
  cursor: string | null,
  where: z.infer<typeof GetTransactionsFiltersSchema>
}

var GET_TRANSACTIONS_QUERY = gql`
  query GetTransactions($pageSize: Int, $cursor: String, $where: CachedTransactionFilterInput) {
    transactions(first: $pageSize, after: $cursor, where: $where) {
      nodes {
        id,
        description,
        value,
        date,
        category {
          id,
          name,
        }
      },
      edges {
        cursor,
        node {
          id,
          description,
          value,
          date,
          category {
            id,
            name,
          }
        }
      },
      pageInfo {
        endCursor,
        hasNextPage,
      }
    },
  }
`;

const TransactionSchema = z.object({
  id: z.string().uuid(),
  description: z.string(),
  value: z.number(),
  date: z.string(),
  category: z.object({
    name: z.string(),
    id: z.string().uuid(),
  })
});

const PageInfoSchema = z.object({
  endCursor: z.string().nullable(),
  hasNextPage: z.boolean(),
});

const GetTransactionsSchema = z.object({
  transactions: z.object({
    nodes: z.array(
      TransactionSchema
    ),
    edges: z.array(
      z.object({
        cursor: z.string(),
        node: TransactionSchema
      })
    ),
    pageInfo: PageInfoSchema
  })
});

export type TransactionType = z.infer<typeof TransactionSchema>

export type GetTransactionsResponseType = z.infer<typeof GetTransactionsSchema>;

function useGetTransactionsQuery(variables: GetTransactionsVariablesType) {
  const { 
    data, 
    loading, 
    error, 
    hasNextPage, 
    loadNextPage,
    filter,
    refetch
  } = useWoodstockQuery(GET_TRANSACTIONS_QUERY, { 
    variables, 
    schema: GetTransactionsSchema,
    filterSchema: GetTransactionsFiltersSchema,
    pageInfoSelector: (data) => data?.transactions.pageInfo,
  });

  useWoodstockSubscription({
    name: "CACHE_UPDATES",
    schema: CacheUpdatesMessageSchema,
    callback: (message) => {
      if(message.entity === "TRANSACTION") {
        refetch();
      }
    }
  }, [refetch]);

  return {
      transactions: data?.transactions.edges.map((edge) => edge.node),
      loading,
      error,
      hasNextPage,
      filter,
      loadNextPage
  }
}

export { useGetTransactionsQuery };
