import { TokenResponse } from "@react-oauth/google";
import { create } from "zustand";

type UseGoogleTokenState = {
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
  credentials: undefined,
  setCredentials: (credentials) => {
    set({ credentials });
  },
}));
