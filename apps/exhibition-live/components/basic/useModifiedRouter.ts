import { Router, useRouter } from "next/router";
import { useCallback } from "react";

export const useModifiedRouter = () => {
  const router = useRouter();
  const locale = router.query.locale || "";

  const push = useCallback<Router["push"]>(
    async (url, as) => {
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
