import { useCallback } from "react";
import { ParsedUrlQuery } from "querystring";
import { ModRouter, Url } from "@slub/edb-global-types";
import { useAdbContext } from "@slub/edb-state-hooks";

const locale = "de";
const asPath = "";
const pathname = "";
const query: ParsedUrlQuery = {
  locale,
};

export const useModifiedRouter: () => ModRouter = () => {
  const { useRouterHook } = useAdbContext();
  const router = useRouterHook();

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
