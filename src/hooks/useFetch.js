import { useCallback, useEffect, useRef, useState } from "react";

export function useFetch(loader, deps = [], { immediate = true } = {}) {
   const [data, setData] = useState(null);
   const [loading, setLoading] = useState(immediate);
   const [error, setError] = useState(null);
   const loaderRef = useRef(loader);
   loaderRef.current = loader;

   const run = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
         const result = await loaderRef.current();
         setData(result);
         return result;
      } catch (err) {
         setError(err);
         return null;
      } finally {
         setLoading(false);
      }
   }, []);

   useEffect(() => {
      if (immediate) run();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, deps);

   return { data, setData, loading, error, reload: run };
}
