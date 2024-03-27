import React, {useCallback} from "react";
import {useSimilarityFinderState} from "./useSimilarityFinderState";

/**
 * a hook that returns a function that can be used to handle key events to cycle through the elements of the similarity finder
 */
export const useKeyEventForSimilarityFinder = (onEnter?: (selectedIndex: number) => void) => {

    const {cycleThroughElements, elementIndex} = useSimilarityFinderState();

    return useCallback(
        (ev: React.KeyboardEvent<HTMLInputElement>) => {
            if (ev.key === "ArrowUp" || ev.key === "ArrowDown") {
                ev.preventDefault();
                ev.stopPropagation();
                cycleThroughElements(ev.key === "ArrowDown" ? 1 : -1);
            } else if (onEnter && ev.key === "Enter") {
                ev.preventDefault();
                ev.stopPropagation();
                onEnter(elementIndex)
            }
        },
        [cycleThroughElements, elementIndex, onEnter],
    )
}
