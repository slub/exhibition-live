import { create } from "zustand";

export type UseSimilarityFinderState = {
  elementIndex: number;
  elementCount: number;
  cycleThroughElements: (offset: number) => void;
  resetElementIndex: () => void;
  setElementCount: (count: number) => void;
  setElementIndex: (index: number) => void;
  activeFinderIds: string[];
  addActiveFinder: (id: string) => void;
  removeActiveFinder: (id: string) => void;
};

export const useSimilarityFinderState = create<UseSimilarityFinderState>(
  (set, get) => ({
    elementIndex: 0,
    elementCount: 10,
    activeFinderIds: [],
    cycleThroughElements: (offset: number) => {
      const { elementIndex, elementCount } = get();
      if (elementIndex === 0 && offset < 0) return;
      if (elementIndex === elementCount && offset > 0) return;
      const newIndex = (elementIndex + offset) % (elementCount + 1);
      set({ elementIndex: newIndex });
    },
    resetElementIndex: () => set({ elementIndex: 0 }),
    setElementCount: (count: number) => set({ elementCount: count }),
    setElementIndex: (index: number) => set({ elementIndex: index }),
    addActiveFinder: (id: string) => {
      if (get().activeFinderIds.includes(id)) return;
      const newActiveFinderIds = [...get().activeFinderIds, id];
      set({ activeFinderIds: newActiveFinderIds });
    },
    removeActiveFinder: (id: string) =>
      set({
        activeFinderIds: get().activeFinderIds.filter(
          (finderId) => finderId !== id,
        ),
      }),
  }),
);
