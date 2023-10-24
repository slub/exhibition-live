import { create } from "zustand";

export type GlobalSearchState = {
  search: string;
  setSearch: (search: string) => void;
  typeName: string;
  setTypeName: (typeName: string) => void;
};

export const useGlobalSearch = create<GlobalSearchState>((set, get) => ({
  search: "",
  setSearch: (search: string) => set({ search }),
  typeName: "Exhibition",
  setTypeName: (typeName: string) => set({ typeName }),
}));
