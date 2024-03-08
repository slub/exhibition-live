import { AsyncOxigraph } from "async-oxigraph";
import { create } from "zustand";
import {PUBLIC_BASE_PATH} from "../config";

const initAsyncOxigraph = async function () {
  const ao = new AsyncOxigraph(PUBLIC_BASE_PATH + "/worker.js");
  await ao.init(PUBLIC_BASE_PATH + "/web_bg.wasm"); // Default is same folder as worker.js
  return ao;
};

type OxigraphStore = {
  oxigraph: { ao: AsyncOxigraph } | undefined;
  init: () => void;
  initialized: boolean;
  bulkLoaded: boolean;
  setBulkLoaded: (b: boolean) => void;
};

export const useOxigraph = create<OxigraphStore>((set, get) => ({
  oxigraph: undefined,
  bulkLoaded: false,
  initialized: false,
  init: async () => {
    console.log("init oxigraph");
    if (get().initialized) return;
    set({ initialized: true });
    console.log("really init oxigraph");
    const ao = await initAsyncOxigraph();
    console.log({ ao });
    set({ oxigraph: { ao } });
  },
  setBulkLoaded: (b) => set({ bulkLoaded: b }),
}));
