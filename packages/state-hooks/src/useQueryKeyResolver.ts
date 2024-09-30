import { create } from "zustand";

type UseQueryKeyResolver = {
  sourceToTargets: {
    [sourceIRI: string]: string[];
  };
  resolveSourceIRIs: (targetIRI: string) => string[];
  updateSourceToTargets: (sourceIRI: string, targetIRIs: string[]) => void;
  removeSource: (sourceIRI: string) => void;
};

export const useQueryKeyResolver = create<UseQueryKeyResolver>((set, get) => ({
  sourceToTargets: {},
  resolveSourceIRIs: (targetIRI: string) => {
    const sourceToTargets = get().sourceToTargets;
    return Object.keys(sourceToTargets).filter((sourceIRI) =>
      sourceToTargets[sourceIRI].includes(targetIRI),
    );
  },
  updateSourceToTargets: (sourceIRI: string, targetIRIs: string[]) => {
    set((state) => ({
      sourceToTargets: {
        ...state.sourceToTargets,
        [sourceIRI]: targetIRIs,
      },
    }));
  },
  removeSource: (sourceIRI: string) => {
    set((state) => {
      const sourceToTargets = state.sourceToTargets;
      delete sourceToTargets[sourceIRI];
      return {
        sourceToTargets,
      };
    });
  },
}));
