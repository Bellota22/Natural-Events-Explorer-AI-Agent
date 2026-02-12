"use client";

import { useCallback, useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("local-storage", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("local-storage", callback);
  };
}

export function useLocalStorageState<T>(
  key: string,
  defaultValue: T,
  parse: (raw: string | null) => T,
  stringify: (val: T) => string
) {
  const getSnapshot = () => parse(window.localStorage.getItem(key));
  const getServerSnapshot = () => defaultValue;

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback(
    (next: T) => {
      window.localStorage.setItem(key, stringify(next));
      window.dispatchEvent(new Event("local-storage"));
    },
    [key, stringify]
  );

  return [value, setValue] as const;
}
