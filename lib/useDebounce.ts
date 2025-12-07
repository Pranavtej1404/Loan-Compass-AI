
import { useEffect, useState } from "react";

export function useDebounce(value: any, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value]);

  return debounced;
}
