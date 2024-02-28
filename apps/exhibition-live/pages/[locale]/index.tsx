import Head from "next/head";
import React from "react";

import { MainLayout } from "../../components/layout/main-layout";
import { Dashboard } from "../../components/content/main/Dashboard";
import { mixinStaticPathsParams, getI18nProps } from "../../components/i18n";
import { useTranslation } from "next-i18next";

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
        <title>{t("exhibition database")}</title>
        <meta name="description" content="a knowledge base about exhibitions" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MainLayout>
        <Dashboard />
      </MainLayout>
    </>
  );
};
