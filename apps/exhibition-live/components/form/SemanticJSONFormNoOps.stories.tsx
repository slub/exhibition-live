import { JSONSchema7 } from "json-schema";
import { useMemo, useState } from "react";
import { uischemata } from "./uischemaForType";
import type { Meta, StoryObj } from "@storybook/react";

import useExtendedSchema from "../state/useExtendedSchema";
import { sladb, slent } from "../config/formConfigs";
import { SemanticJsonFormNoOps } from "./SemanticJsonFormNoOps";

export default {
  title: "form/exhibition/SemanticJsonFormNoOps",
  component: SemanticJsonFormNoOps,
} as Meta<typeof SemanticJsonFormNoOps>;

type ExampleData = {
  typeIRI: string;
  typeName: string;
  data: any;
};

const makeExampleData: (typeName: string, data: any) => ExampleData = (
  typeName: string,
  data: any,
) => {
  const typeIRI = sladb[typeName].value;
  return {
    typeIRI,
    typeName,
    data: {
      "@id": slent[typeName + "#s-12"].value,
      "@type": typeIRI,
      ...data,
    },
  };
};

const SemanticJsonFormNoOperationsExample = ({
  typeName,
  defaultData,
}: {
  typeName: string;
  defaultData: any;
}) => {
  const { typeIRI, data: initialData } = makeExampleData(typeName, defaultData);
  const [data, setData] = useState<any>(initialData);
  const loadedSchema = useExtendedSchema({ typeName });
  const uischema = useMemo(() => uischemata[typeName], [typeName]);

  return (
    <SemanticJsonFormNoOps
      data={data}
      onChange={setData}
      typeIRI={typeIRI}
      searchText={""}
      schema={loadedSchema as JSONSchema7}
      jsonFormsProps={{
        uischema,
      }}
    />
  );
};

const exhibitionExample = makeExampleData("Exhibition", {
  title: "Otto Dix Ausstellung",
});

export const SemanticJsonFormNoOperationsExhibition = () => {
  const { typeIRI, typeName, data: initialData } = exhibitionExample;
  const [data, setData] = useState<any>(initialData);
  const loadedSchema = useExtendedSchema({ typeName });
  const uischema = useMemo(() => uischemata[typeName], [typeName]);

  return (
    <SemanticJsonFormNoOps
      data={data}
      onChange={setData}
      typeIRI={typeIRI}
      searchText={""}
      schema={loadedSchema as JSONSchema7}
      jsonFormsProps={{
        uischema,
      }}
    />
  );
};

export const SemanticJsonFormNoOperationsTag = () => {
  return (
    <SemanticJsonFormNoOperationsExample
      typeName="Tag"
      defaultData={{ title: "Historische Werke" }}
    />
  );
};
