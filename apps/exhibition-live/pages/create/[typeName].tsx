import Head from "next/head";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import React, { useMemo } from "react";

import TypedForm from "../../components/content/main/TypedFormNoSSR";
import { sladb, slent } from "../../components/form/formConfigs";
import { MainLayout } from "../../components/layout/main-layout";
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
  const searchParam = useSearchParams();
  const id = searchParam.get("id") as string | null | undefined;

  const classIRI: string | undefined =
    typeof typeName === "string" ? sladb(typeName).value : undefined;

  return (
    <>
      <Head>
        <title>Neue {typeName} anlegen - Ausstellungserfassung</title>
        <meta name="description" content="a knowledge base about exhibitions" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MainLayout>
        {classIRI && typeName && (
          <TypedForm typeName={typeName} classIRI={classIRI} />
        )}
      </MainLayout>
    </>
  );
};
