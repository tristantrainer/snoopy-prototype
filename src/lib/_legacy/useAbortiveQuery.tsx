import { useState, useEffect } from "react";
import { useApolloClient } from "@apollo/client";

function useAbortiveQuery({ query, params, deps }) {
  const [data, setData] = useState();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const apolloClient = useApolloClient();

  useEffect(() => {
    setLoading(true);
    
    const watchedQuery = apolloClient.watchQuery({
      query,
      ...params,
      fetchPolicy: params?.fetchPolicy || "cache-and-network",
    });

    const sub = watchedQuery.subscribe({
      next(x) {
        if (!x.partial) {
          setData(x.data);
          setError(null);
          setLoading(false);
        }
      },
      error(err) {
        setError(err);
        setLoading(false);
      },
      complete() {
        setLoading(false);
      },
    });

    return () => {
      sub.unsubscribe();
    };
  }, [deps]);

  return { data, error, loading };
}

export { useAbortiveQuery };