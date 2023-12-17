import { TokenResponse } from "@react-oauth/google";
import { create } from "zustand";

type UseGoogleTokenState = {
  initialized?: boolean;
  init: () => void;
  clear: () => void;
  credentials?: Omit<
    TokenResponse,
    "error" | "error_description" | "error_uri"
  >;
  setCredentials: (
    credentials: Omit<
      TokenResponse,
      "error" | "error_description" | "error_uri"
    >,
  ) => void;
};

export const useGoogleToken = create<UseGoogleTokenState>((set) => ({
  initialized: false,
  init: () => {
    const credentials = localStorage.getItem("googleCredentials");
    if (credentials) {
      set({ credentials: JSON.parse(credentials) });
    }
    set({ initialized: true });
  },
  clear: () => {
    localStorage.removeItem("googleCredentials");
    set({ credentials: undefined });
  },
  credentials: undefined,
  setCredentials: (credentials) => {
    localStorage.setItem("googleCredentials", JSON.stringify(credentials));
    set({ credentials });
  },
}));
