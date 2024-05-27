import { useCallback } from "react";
import { ModRouter, Url } from "@slub/edb-global-types";
import { useAdbContext } from "./provider";

type Options = {
  locale: string;
};
export const useModifiedRouter: (options?: Options) => ModRouter = (
  options,
) => {
  const { useRouterHook } = useAdbContext();
  const router = useRouterHook();

  const { locale = "de" } = options || {};

  const push = useCallback(
    async (url: string, as: Url) => {
      let skipLocaleHandling = false;
      if (url.toString().indexOf("http") === 0) skipLocaleHandling = true;
      if (locale && !skipLocaleHandling) {
        return await router.push(`/${locale}${url.toString()}`, as);
      }
      return false;
    },
    [locale, router],
  );
  return {
    ...router,
    push,
  };
};
