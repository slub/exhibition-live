import Head from "next/head";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import React, { useCallback, useMemo } from "react";

import TypedForm from "../../components/content/main/TypedFormNoSSR";
import { sladb, slent } from "../../components/form/formConfigs";
import { MainLayout } from "../../components/layout/main-layout";
import schema from "../../public/schema/Exhibition.schema.json";
import { BASE_IRI } from "../../components/config";
import { v4 as uuidv4 } from "uuid";
import { useFormData } from "../../components/state";

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
  const classIRI: string | undefined = useMemo(
    () => (typeof typeName === "string" ? sladb(typeName).value : undefined),
    [typeName],
  );
  const { setFormData } = useFormData();
  const searchParam = useSearchParams();
  const handleNew = useCallback(() => {
    const newURI = `${BASE_IRI}${uuidv4()}`;
    const newData = {
      "@id": newURI,
      "@type": classIRI,
    };
    setFormData(newData);
  }, [setFormData, classIRI]);

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
          <>
            <TypedForm typeName={typeName} classIRI={classIRI} />
          </>
        )}
      </MainLayout>
    </>
  );
};
