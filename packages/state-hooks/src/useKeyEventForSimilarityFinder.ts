import React, { useCallback } from "react";
import { useSimilarityFinderState } from "./useSimilarityFinderState";

/**
 * a hook that returns a function that can be used to handle key events to cycle through the elements of the similarity finder
 */
export const useKeyEventForSimilarityFinder = (
  onEnter?: (selectedIndex: number) => void,
  disableEnter?: boolean,
) => {
  const { cycleThroughElements, elementIndex, setAcceptWishPending } =
    useSimilarityFinderState();

  const handleEnter = useCallback(
    () => (onEnter ? onEnter(elementIndex) : setAcceptWishPending(true)),
    [setAcceptWishPending, onEnter, elementIndex],
  );

  return useCallback(
    (ev: React.KeyboardEvent<HTMLInputElement>) => {
      if (ev.key === "ArrowUp" || ev.key === "ArrowDown") {
        ev.preventDefault();
        ev.stopPropagation();
        cycleThroughElements(ev.key === "ArrowDown" ? 1 : -1);
      } else if (ev.key === "PageUp" || ev.key === "PageDown") {
        ev.preventDefault();
        ev.stopPropagation();
        cycleThroughElements(ev.key === "PageDown" ? 10 : -10);
      } else if (!disableEnter && ev.key === "Enter") {
        ev.preventDefault();
        ev.stopPropagation();
        handleEnter();
      }
    },
    [cycleThroughElements, handleEnter, disableEnter],
  );
};
