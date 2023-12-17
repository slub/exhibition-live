import { getI18nProps, mixinStaticPathsParams } from "../../../components/i18n";
import { useTranslation } from "react-i18next";
import { Dashboard } from "@mui/icons-material";
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
  return (
    <>
      <Head>
        <title>
          {t("exhibition database")} {t("data import")}
        </title>
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
