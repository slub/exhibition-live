import { create } from "zustand";

export type UseRightDrawerState = {
  open: boolean;
  setOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  width: number;
  setWidth: (width: number | ((oldWidth: number) => number)) => void;
};

export const useRightDrawerState = create<UseRightDrawerState>((set, get) => ({
  open: false,
  setOpen: (open) =>
    typeof open === "function"
      ? set({ open: open(get().open) })
      : set({ open }),
  width: 500,
  setWidth: (widthPassed) => {
    const width = typeof widthPassed === "function" ? widthPassed(get().width) : widthPassed;
    if(typeof width === "number" && !isNaN(width))  set({width});
  },
}));
