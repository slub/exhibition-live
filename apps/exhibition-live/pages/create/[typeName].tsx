import Head from "next/head";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import TypedForm from "../../components/content/main/TypedForm";
import { sladb, slent } from "../../components/form/formConfigs";
import { MainLayout } from "../../components/layout/main-layout";
import schema from "../../public/schema/Exhibition.schema.json";
import { BASE_IRI } from "../../components/config";
import { v4 as uuidv4 } from "uuid";
import { decodeIRI } from "../../components/utils/core";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const { typeName } = props;
  const classIRI: string | undefined = useMemo(
    () => (typeof typeName === "string" ? sladb(typeName).value : undefined),
    [typeName],
  );
  const [entityIRI, setEntityIRI] = useState(`${BASE_IRI}${uuidv4()}`);
  const searchParam = useSearchParams();
  useEffect(() => {
    const encID = searchParam.get("encID");
    const id = typeof encID === "string" ? decodeIRI(encID) : undefined;
    const newURI = id || `${BASE_IRI}${typeName}-${uuidv4()}`;
    setEntityIRI(newURI);
  }, [setEntityIRI, typeName, searchParam]);

  return (
    <>
      <Head>
        <title>Neue {t(typeName)} anlegen - Ausstellungserfassung</title>
        <meta name="description" content="a knowledge base about exhibitions" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MainLayout>
        {classIRI && typeName && (
          <>
            <TypedForm
              key={entityIRI}
              entityIRI={entityIRI}
              typeName={typeName}
              classIRI={classIRI}
            />
          </>
        )}
      </MainLayout>
    </>
  );
};
