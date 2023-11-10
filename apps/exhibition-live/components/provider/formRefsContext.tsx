import React, {
  createContext,
  createRef,
  ForwardedRef,
  RefObject,
} from "react";

type FormRefsContextValue = {
  stepperRef: RefObject<any | HTMLElement | undefined>;
  actionRef: RefObject<any | HTMLElement | undefined>;
  toolbarRef?: RefObject<any | HTMLElement | undefined>;
  searchRef?: RefObject<any | HTMLElement | undefined>;
};
export const FormRefsContext = createContext<FormRefsContextValue>({
  stepperRef: undefined,
  actionRef: undefined,
  toolbarRef: undefined,
  searchRef: undefined,
});

export const useFormRefsContext = () => React.useContext(FormRefsContext);

const stepperRef = createRef<HTMLElement | undefined>();
const actionRef = createRef<HTMLElement | undefined>();
const toolbarRef = createRef<HTMLElement | undefined>();
const searchRef = createRef<HTMLElement | undefined>();
export const FormRefsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <FormRefsContext.Provider
      value={{ stepperRef, actionRef, toolbarRef, searchRef }}
    >
      {children}
    </FormRefsContext.Provider>
  );
};
