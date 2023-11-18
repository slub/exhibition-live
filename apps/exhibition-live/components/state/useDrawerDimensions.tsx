import { create } from "zustand";

export type UseDrawerHeightState = {
  drawerHeight: number;
  setDrawerHeight: (height: number) => void;
  minDrawerHeight: number;
  maxDrawerHeight: number;

  drawerWidth: number;
  setDrawerWidth: (width: number) => void;
  minDrawerWidth: number;
  maxDrawerWidth: number;
};

export const useDrawerDimensions = create<UseDrawerHeightState>((set) => ({
  drawerHeight: 72,
  setDrawerHeight: (height: number) => set({ drawerHeight: height }),
  minDrawerHeight: 72,
  maxDrawerHeight: 1000,

  drawerWidth: 50,
  setDrawerWidth: (width: number) => set({ drawerWidth: width }),
  minDrawerWidth: 50,
  maxDrawerWidth: 1000,
}));
