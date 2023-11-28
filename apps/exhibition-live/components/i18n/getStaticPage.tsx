import { serverSideTranslations } from "next-i18next/serverSideTranslations";
const locales = ["en", "de"];
export const getI18nPaths = () =>
  locales.map((lng) => ({
    params: {
      locale: lng,
    },
  }));

export const getStaticPaths = () => ({
  fallback: false,
  paths: getI18nPaths(),
});

export const mixinStaticPathsParams = (paths) =>
  paths
    .map((path) =>
      getI18nPaths().map((i18nPath) => ({
        params: { ...path.params, ...i18nPath.params },
      })),
    )
    .flat();

export async function getI18nProps(ctx, ns = ["translation"]) {
  const locale = ctx?.params?.locale;
  let props = {
    ...(await serverSideTranslations(locale, ns)),
  };
  return props;
}

export function makeStaticProps(ns?: any) {
  return async function getStaticProps(ctx) {
    return {
      props: await getI18nProps(ctx, ns),
    };
  };
}
