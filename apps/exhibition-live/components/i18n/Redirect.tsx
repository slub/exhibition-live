import { useEffect } from "react";
import languageDetector from "./languageDetector";
import { useModifiedRouter } from "../basic";

export const useRedirect = (to?: string) => {
  const router = useModifiedRouter();
  to = to || router.asPath;

  // language detection
  useEffect(() => {
    const detectedLng = languageDetector.detect();
    if (to.startsWith("/" + detectedLng) && router.asPath === "/404") {
      // prevent endless loop
      router.replace("/" + detectedLng + router.asPath);
      return;
    }

    languageDetector.cache(detectedLng);
    router.replace("/" + detectedLng + to);
  });

  return <></>;
};

export const Redirect = () => {
  useRedirect();
  return <></>;
};

// eslint-disable-next-line react/display-name
export const getRedirect = (to) => () => {
  useRedirect(to);
  return <></>;
};
