import Head from "next/head";
import React from "react";

import { sladb, slent } from "../components/form/formConfigs";
import { MainLayout } from "../components/layout/main-layout";
import { useRDFDataSources } from "../components/state";

type Props = {
  children: React.ReactChild;
  data: any;
  classIRI: string;
};
const classIRI = sladb.Exhibition.value;
const exampleData = {
  "@id": slent["Exhibition#s-12"].value,
  "@type": classIRI,
  title: "Otto Dix Ausstellung",
};
export default () => {
  const { bulkLoaded } = useRDFDataSources("/ontology/exhibition-info.owl.ttl");

  return (
    <>
      <Head>
        <title>Ausstellungserfassung</title>
        <meta name="description" content="a knowledge base about exhibitions" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MainLayout>Welcome to the exhibition data entry app.</MainLayout>
    </>
  );
};
