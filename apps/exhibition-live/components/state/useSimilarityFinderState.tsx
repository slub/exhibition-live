import {create} from "zustand";

export type UseSimilarityFinderState = {
  elementIndex: number;
  elementCount: number;
  cycleThroughElements: (offset: number) => void;
  resetElementIndex: () => void;
  setElementCount: (count: number) => void;
  setElementIndex: (index: number) => void;
};

export const useSimilarityFinderState = create<UseSimilarityFinderState>(
  (set, get) => ({
    elementIndex: 0,
    elementCount: 10,
    cycleThroughElements: (offset: number) => {
      const { elementIndex, elementCount } = get();
      if (elementIndex === 0 && offset < 0) return;
      if(elementIndex === elementCount - 1 && offset > 0) return;
      const newIndex = (elementIndex + offset) % elementCount;
      set({ elementIndex: newIndex });
    },
    resetElementIndex: () => set({ elementIndex: 0 }),
    setElementCount: (count: number) => set({ elementCount: count }),
    setElementIndex: (index: number) => set({ elementIndex: index }),
  }),
);

