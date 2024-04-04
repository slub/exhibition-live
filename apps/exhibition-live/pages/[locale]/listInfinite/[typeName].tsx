import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";

import { MainLayout } from "../../../components/layout/main-layout";
import schema from "../../../public/schema/Exhibition.schema.json";
import { TypedInfiniteList } from "../../../components/content/main/TypedInfiniteList";
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
  const { typeName } = props;
  const title = `Ausstellungserfassung - ${typeName}`;

  return (
    <>
      <Head>
        <title>${title}</title>
        <meta name="description" content="a knowledge base about exhibitions" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MainLayout>
        <TypedInfiniteList typeName={typeName} />
      </MainLayout>
    </>
  );
};
