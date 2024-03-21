import React, {useCallback} from "react";
import {useSimilarityFinderState} from "./useSimilarityFinderState";

/**
 * a hook that returns a function that can be used to handle key events to cycle through the elements of the similarity finder
 */
export const useKeyEventForSimilarityFinder = () => {

    const {cycleThroughElements} = useSimilarityFinderState();

    return useCallback(
        (ev: React.KeyboardEvent<HTMLInputElement>) => {
            if (ev.key === "ArrowUp" || ev.key === "ArrowDown") {
                cycleThroughElements(ev.key === "ArrowDown" ? 1 : -1);
                ev.preventDefault();
            }
        },
        [cycleThroughElements],
    )
}
