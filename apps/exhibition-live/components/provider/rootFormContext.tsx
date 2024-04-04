import { ReactNode, createContext, useContext } from "react";

type RootFormContextValue = {
  isWithinRootForm: boolean;
};

export const RootFormContext = createContext<RootFormContextValue>({
  isWithinRootForm: false,
});

export const RootFormProvider = ({ children }: { children: ReactNode }) => {
  return (
    <RootFormContext.Provider value={{ isWithinRootForm: true }}>
      {children}
    </RootFormContext.Provider>
  );
};
export const useRootFormContext = () => useContext(RootFormContext);
