import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";

import { MainLayout } from "../../components/layout/main-layout";
import { TypedList } from "../../components/content/main/TypedList";

export default () => {
  const router = useRouter();
  const { typeName } = router.query as { typeName: string };

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
