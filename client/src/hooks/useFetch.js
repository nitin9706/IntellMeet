import { useCallback, useEffect, useState } from "react";

// Loads a list from the API. Accepts {data|meetings|recordings: []} or a bare array.
export default function useFetch(fn) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fn();
      const list = Array.isArray(res)
        ? res
        : (res.data ?? res.meetings ?? res.recordings ?? []);
      setData(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [fn]);

  useEffect(() => {
    load();
  }, [load]);
  return { data, loading, error, reload: load };
}
