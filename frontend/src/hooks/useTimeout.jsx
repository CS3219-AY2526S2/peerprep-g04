import { useEffect, useRef } from "react";

export function useTimeout(cb, delay) {
  const cbRef = useRef();
  cbRef.current = cb;

  useEffect(() => {
    if (!delay) return;
    
    const id = setTimeout(() => cbRef.current?.(), delay);
    return () => clearTimeout(id);
  }, [delay]);
}