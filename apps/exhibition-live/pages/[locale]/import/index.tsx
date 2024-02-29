import { getI18nProps, mixinStaticPathsParams } from "../../../components/i18n";
import { useTranslation } from "next-i18next";
import { MainLayout } from "../../../components/layout/main-layout";
import Head from "next/head";
import { ImportPage } from "../../../components/importExport/ImportPage";

export async function getStaticPaths() {
  const paths = mixinStaticPathsParams([
    {
      params: {},
    },
  ]);

  return { paths, fallback: false };
}

export async function getStaticProps(ctx) {
  return {
    props: {
      ...(await getI18nProps(ctx)),
    },
  };
}

export default () => {
  const { t } = useTranslation("translation");
  const title = `${t("exhibition database")} ${t("data import")}`
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="a knowledge base about exhibitions" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MainLayout>
        <ImportPage />
      </MainLayout>
    </>
  );
};
