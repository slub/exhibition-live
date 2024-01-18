import { createContext } from "react";
import { useOptionalLiveDemoEndpoint } from "../state/useOptionalLiveDemoEndpoint";

type AdbContextValue = {};
export const AdbContext = createContext<AdbContextValue>({});

export const AdbProvider = ({ children }: { children: React.ReactNode }) => {
  useOptionalLiveDemoEndpoint();
  return <AdbContext.Provider value={{}}>{children}</AdbContext.Provider>;
};
