import {AsyncOxigraph} from 'async-oxigraph'
import { create } from 'zustand'

const initAsyncOxigraph = async function () {
  const ao = new AsyncOxigraph('./worker.js')
  await ao.init('./web_bg.wasm') // Default is same folder as worker.js
  return ao

}


type OxigraphStore = {
  oxigraph: AsyncOxigraph | undefined
  init: () => Promise<AsyncOxigraph>
  bulkLoaded: boolean
  setBulkLoaded: (b: boolean) => void
}

export const useOxigraph = create<OxigraphStore>((set, get) => ({
  oxigraph: undefined,
  bulkLoaded: false,
  init: async () => {
    if(get().oxigraph) return get().oxigraph as AsyncOxigraph
    const ao = await initAsyncOxigraph()
    set({oxigraph: ao})
    return ao
  },
  setBulkLoaded: (b) => set({bulkLoaded: b})
}))



