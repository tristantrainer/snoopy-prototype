'use client';

import { gql, useQuery } from "@apollo/client";
import { useState } from "react";
import { z } from "zod";
import { useCustomQuery } from "@/lib/apollo/useQuery";
import { PagingVariables } from "@/lib/apollo/types";
import { FilterVariables } from "../types";
import { useCacheUpdatedSubscription } from "../subscriptions/cacheUpdatedSubscription";

const GetTransactionsFiltersSchema = z.object({
  description: z.object({
    contains: z.string().optional(),
  }).optional()
}).nullable(); 

type GetTransactionsFiltersType = z.infer<typeof GetTransactionsFiltersSchema>;

export type GetTransactionsVariablesType = PagingVariables & FilterVariables<GetTransactionsFiltersType>;

const query = gql`
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

export function useGetTransactionsQuery(initialVariables: GetTransactionsVariablesType = { pageSize: 10, cursor: null, where: null }) {
    const { 
      data, 
      loading, 
      error, 
      refetch,
      loadNextPage,
      filter, 
    } = useCustomQuery(query, {
      schema: GetTransactionsSchema,
      variables: initialVariables,
      paging: {
        pageInfoSelector: (data) => data?.transactions.pageInfo
      },
      filtering: {
        schema: GetTransactionsFiltersSchema
      }
    });

    useCacheUpdatedSubscription((message) => {
      if(message.entity === "TRANSACTION") {
        refetch();
      }
    }, [refetch]);
    
    return {
      data, 
      loading, 
      error, 
      loadNextPage, 
      filter,
    }
}

export function VisualiseQuery() {
    const {
      loading, 
      error, 
      data, 
      loadNextPage, 
      filter,
    } = useGetTransactionsQuery();

    const [descriptionFilter, setDescriptionFilter] = useState("");

    return (
      <div>
        {loading ? <div>Loading...</div> : <div>Loaded!</div>}
        {error ? <div>Error: {error}</div> : <div>No Errors!</div>}
        <div onClick={() => loadNextPage()}>Fetch More</div>
        {data ? RenderData(data.transactions.edges.map((edge) => edge.node)) : <div>Failed to load data...</div>}
        <div>
          <input value={descriptionFilter} onChange={(e) => setDescriptionFilter(e.target.value)} />
          <div onClick={() => filter({ description: { contains: descriptionFilter }})}>Apply</div>
        </div>
      </div>
    )
}

function RenderData(transactions: TransactionType[]) {
  return (
    transactions.map((transaction) => <div key={transaction.id}>{transaction.description}</div>)
  )
}