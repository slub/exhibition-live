import { create } from "zustand";

export type UseSimilarityFinderState = {
  elementIndex: number;
  elementCount: number;
  cycleThroughElements: (offset: number) => void;
  resetElementIndex: () => void;
};

export const useSimilarityFinderState = create<UseSimilarityFinderState>(
  (set, get) => ({
    elementIndex: 0,
    elementCount: 10,
    cycleThroughElements: (offset: number) => {
      const { elementIndex, elementCount } = get();
      const newIndex = (elementIndex + offset) % elementCount;
      set({ elementIndex: newIndex });
    },
    resetElementIndex: () => set({ elementIndex: 0 }),
  }),
);
