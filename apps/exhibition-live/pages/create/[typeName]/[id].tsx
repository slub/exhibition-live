import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useMemo } from "react";

import TypedForm from "../../../components/content/main/TypedForm";
import { sladb } from "../../../components/form/formConfigs";
import { MainLayout } from "../../../components/layout/main-layout";
import { useFormData } from "../../../components/state";
import { decodeIRI } from "../../../components/utils/core";

type Props = {
  children: React.ReactChild;
  data: any;
  classIRI: string;
};
export default () => {
  //const {bulkLoaded} = useRDFDataSources('/ontology/exhibition-info.owl.ttl')
  const router = useRouter();
  const { typeName, id: encodedID } = router.query as {
    typeName: string | null | undefined;
    id: string | null | undefined;
  };
  const classIRI: string | undefined =
    typeof typeName === "string" ? sladb(typeName).value : undefined;
  const id = useMemo(
    () => (typeof encodedID === "string" ? decodeIRI(encodedID) : undefined),
    [encodedID],
  );

  const { setFormData } = useFormData();

  useEffect(() => {
    if (id && classIRI) {
      setFormData({
        "@id": id,
        "@type": classIRI,
      });
    }
  }, [setFormData, id, classIRI]);

  return (
    <>
      <Head>
        <title>Ausstellung bearbeiten - Ausstellungserfassung</title>
        <meta name="description" content="a knowledge base about exhibitions" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MainLayout>
        {classIRI && typeName && (
          <TypedForm
            key={id || "empty"}
            typeName={typeName as string}
            classIRI={classIRI as string}
          />
        )}
      </MainLayout>
    </>
  );
};
