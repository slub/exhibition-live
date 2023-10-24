import { button } from "@storybook/addon-knobs";
import { ComponentMeta } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { JSONSchema7 } from "json-schema";
import { JSONSchemaFaker } from "json-schema-faker";
import { useState } from "react";

import schema from "../../schema/exhibition-info.schema.json";
import useExtendedSchema from "../state/useExtendedSchema";
import { useLocalSettings, useSettings } from "../state/useLocalSettings";
import { oxigraphCrudOptions } from "../utils/sparql/remoteOxigraph";
import {
  defaultJsonldContext,
  defaultPrefix,
  defaultQueryBuilderOptions,
  sladb,
  slent,
} from "./formConfigs";
import SemanticJsonForm from "./SemanticJsonForm";

export const queryClient = new QueryClient();

const exhibitionSchema = { ...schema, ...schema.$defs.Exhibition };

const classIRI = sladb.Exhibition.value;
const exampleData = {
  "@id": slent["Exhibition#s-12"].value,
  "@type": classIRI,
  title: "Otto Dix Ausstellung",
};

const SemanticJsonFormOneShot = () => {
  const [data, setData] = useState<any>(exampleData);
  const { activeEndpoint } = useSettings();
  const crudOptions =
    activeEndpoint && oxigraphCrudOptions(activeEndpoint.endpoint);
  button("generate random entry", () => {
    // @ts-ignore
    setData(JSONSchemaFaker.generate(exhibitionSchema));
  });
  const typeName = "Exhibition";
  const loadedSchema = useExtendedSchema({ typeName, classIRI });

  return (
    <SemanticJsonForm
      data={data}
      setData={setData}
      entityIRI={data["@id"]}
      typeIRI={classIRI}
      crudOptions={crudOptions}
      defaultPrefix={defaultPrefix}
      searchText={""}
      shouldLoadInitially
      jsonldContext={defaultJsonldContext}
      queryBuildOptions={defaultQueryBuilderOptions}
      schema={loadedSchema as JSONSchema7}
      jsonFormsProps={{}}
    />
  );
};
export const SemanticJsonFormExhibition = () => {
  const [data, setData] = useState<any>(exampleData);
  button("generate random entry", () => {
    // @ts-ignore
    setData(JSONSchemaFaker.generate(exhibitionSchema));
  });

  return (
    <QueryClientProvider client={queryClient}>
      <SemanticJsonFormOneShot />
    </QueryClientProvider>
  );
};
export default {
  title: "form/exhibition/EditExhibitionJSONForm",
  component: SemanticJsonForm,
} as ComponentMeta<typeof SemanticJsonForm>;
