import { AsyncOxigraph } from "async-oxigraph";
import { create } from "zustand";
import { useAdbContext } from "./provider";
import { useEffect } from "react";

const initAsyncOxigraph = async function (publicBasePath: string) {
  const ao = AsyncOxigraph.getInstance(publicBasePath + "/worker.js");
  await ao.init(publicBasePath + "/web_bg.wasm"); // Default is same folder as worker.js
  return ao;
};

type OxigraphStore = {
  oxigraph: { ao: AsyncOxigraph } | undefined;
  init: (baseIRI: string) => void;
  initialized: boolean;
  bulkLoaded: boolean;
  setBulkLoaded: (b: boolean) => void;
};

export const useOxigraphZustand = create<OxigraphStore>((set, get) => {
  return {
    oxigraph: undefined,
    bulkLoaded: false,
    initialized: false,
    init: async (publicBasePath: string) => {
      if (get().initialized) return;
      set({ initialized: true });
      console.log("really init oxigraph");
      const ao = await initAsyncOxigraph(publicBasePath);
      console.log({ ao });
      set({ oxigraph: { ao } });
    },
    setBulkLoaded: (b) => set({ bulkLoaded: b }),
  };
});

export const useOxigraph: () => Omit<OxigraphStore, "init"> = () => {
  const {
    env: { publicBasePath },
  } = useAdbContext();
  const { init, ...state } = useOxigraphZustand();

  useEffect(() => {
    init(publicBasePath);
  }, [init, publicBasePath]);

  return {
    ...state,
  };
};
