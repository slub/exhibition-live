import Head from "next/head";
import React from "react";

import { MainLayout } from "../../components/layout/main-layout";
import { Dashboard } from "../../components/content/main/Dashboard";
import { makeStaticProps, getStaticPaths } from "../../components/i18n";

const getStaticProps = makeStaticProps();
export { getStaticPaths, getStaticProps };

export default () => {
  return (
    <>
      <Head>
        <title>Ausstellungserfassung</title>
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
