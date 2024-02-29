import { gql } from "@apollo/client";
import { z } from "zod";
import { CacheUpdatesMessageSchema, useWoodstockSubscription } from "@/lib/apollo/hooks/useQueryUpdateSubscription";
import { useCustomQuery } from "@/lib/apollo/useQuery";

export type GetAccountsVariablesType = {
    pageSize: number,
    cursor: string | null
}

var GET_ACCOUNTS_QUERY = gql`
  query GetAccounts($pageSize: Int, $cursor: String) {
    accounts(first: $pageSize, after: $cursor) {
      nodes {
        name,
        id,
        balance,
        category { 
          name,
          id,
        },
      },
      edges {
        cursor,
        node {
          name,
          id,
          balance,
          category { 
            name,
            id,
          },
        }
      },
      pageInfo {
        endCursor,
        startCursor,
        hasNextPage,
      }
    },
  }
`;

const GetAccountsSchema = z.object({
  accounts: z.object({
    nodes: z.array(
      z.object({
        id: z.string().uuid(),
        name: z.string(),
        balance: z.number(),
        category: z.object({
          name: z.string(),
          id: z.string().uuid(),
        })
      })
    ),
    edges: z.array(
      z.object({
        cursor: z.string(),
        node: z.object({
          id: z.string().uuid(),
          name: z.string(),
          balance: z.number(),
          category: z.object({
            name: z.string(),
            id: z.string().uuid(),
          })
        })
      })
    ),
    pageInfo: z.object({
      endCursor: z.string().nullable(),
      hasNextPage: z.boolean(),
    })
  })
});


function useGetAccountsQuery(variables: GetAccountsVariablesType) {
  const { 
    data, 
    loading, 
    error, 
    hasNextPage, 
    refetch,
    loadNextPage,
  } = useCustomQuery(GET_ACCOUNTS_QUERY, { 
    schema: GetAccountsSchema,
    variables, 
    pageInfoSelector: (data) => data?.accounts.pageInfo,
  });

  useWoodstockSubscription({
    name: "CACHE_UPDATES",
    schema: CacheUpdatesMessageSchema,
    callback: (message) => {
      if(message.entity === "ACCOUNT") {
        refetch();
      }
    }
  }, [refetch])
    
  return {
    accounts: data?.accounts.edges.map((edge) => edge.node),
    loading,
    error,
    hasNextPage,
    loadNextPage
  }
}

// function useGetAccountsQuery(variables: GetAccountsVariablesType) {
//   const { 
//     data, 
//     loading, 
//     error, 
//     hasNextPage,
//     refresh, 
//     loadNextPage 
//   } = usePagedQuery<GetAccountsQueryType, GetAccountsVariablesType>(GET_ACCOUNTS_QUERY, variables, (data) => data?.accounts.pageInfo);
  
//   const accounts = useMemo(() => data?.accounts.edges.map((edge) => edge.node), [data]);

//   const onCacheUpdate = useCallback((message: CacheUpdateMessageType) => {
//       if(message.entity === "ACCOUNT") {
//           refresh();
//       }
//   }, [refresh]);

//   useCacheUpdatesSubscription(onCacheUpdate);

//   return {
//     accounts,
//     loading,
//     error,
//     hasNextPage,
//     loadNextPage
//   }
// }

// export { useGetAccountsQuery };