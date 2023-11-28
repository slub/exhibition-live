import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";

import { MainLayout } from "../../../components/layout/main-layout";
import { TypedList } from "../../../components/content/main/TypedList";
import schema from "../../../public/schema/Exhibition.schema.json";
import { useTranslation } from "react-i18next";
import { getI18nProps, mixinStaticPathsParams } from "../../../components/i18n";

type Props = {
  typeName: string;
};
export async function getStaticPaths() {
  const paths = mixinStaticPathsParams(
    Object.keys(schema.$defs || {}).map((typeName) => ({
      params: { typeName },
    })),
  );

  return { paths, fallback: false };
}

export async function getStaticProps(ctx) {
  const params = ctx?.params || {};
  const typeName = params.typeName;
  return {
    props: {
      typeName,
      ...getI18nProps(ctx),
    },
  };
}
export default (props: Props) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { typeName } = props;

  return (
    <>
      <Head>
        <title>
          {t(typeName, { count: 2 })} - {t("list")}
        </title>
        <meta name="description" content="a knowledge base about exhibitions" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MainLayout>
        <TypedList typeName={typeName} />
      </MainLayout>
    </>
  );
};
