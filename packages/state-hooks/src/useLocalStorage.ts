import { SetStateAction, useCallback, useEffect, useState } from "react";

const initialize = <T>(key: string, initialValue: T) => {
  try {
    const item = localStorage.getItem(key);
    if (item && item !== "undefined") {
      return JSON.parse(item) as T;
    }

    localStorage.setItem(key, JSON.stringify(initialValue));
    return initialValue;
  } catch {
    return initialValue;
  }
};
export const useLocalStorage: <T>(
  key: string,
  initialValue: T,
) => [T | null, (value: T) => void, () => void] = <T>(key, initialValue) => {
  const [state, setState] = useState<T | null>(); // problem is here

  useEffect(() => {
    const v = initialize<T>(key, initialValue);
    setState(v);
  }, [key]);

  const setValue = useCallback(
    (value: SetStateAction<T>) => {
      try {
        setState((oldState) => {
          const newValue =
            typeof value === "function" ? value(oldState) : value;
          console.log("newValue", newValue);
          localStorage.setItem(key, JSON.stringify(newValue));
          return newValue;
        });
      } catch (error) {
        console.log(error);
      }
    },
    [key],
  );

  const remove = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.log(error);
    }
  }, [key]);

  return [state, setValue, remove];
};
