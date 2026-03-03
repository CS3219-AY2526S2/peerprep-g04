import { useEffect, useRef } from "react";

// if delay is null, pause the interval.
export function useInterval(cb, delay) {
  const ref = useRef();
  ref.current = cb;
  
  useEffect(() => {
    if (delay) {
      const id = setInterval(() => ref.current(), delay);
      return () => clearInterval(id);
    }
    return undefined;
  }, [delay])
}