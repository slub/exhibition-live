import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";

import { MainLayout } from "../../components/layout/main-layout";
import { TypedList } from "../../components/content/main/TypedList";
import schema from "../../public/schema/Exhibition.schema.json";

type Props = {
  typeName: string;
};
export async function getStaticPaths() {
  const paths = Object.keys(schema.$defs || {}).map((typeName) => ({
    params: { typeName },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const typeName = params.typeName;
  return {
    props: {
      typeName,
    },
  };
}
export default (props: Props) => {
  const router = useRouter();
  const { typeName } = props;

  return (
    <>
      <Head>
        <title>Ausstellungserfassung - {typeName}</title>
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
