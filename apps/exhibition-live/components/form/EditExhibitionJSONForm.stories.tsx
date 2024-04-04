import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { JSONSchema7 } from "json-schema";
import { useState } from "react";

import schema from "../../public/schema/Exhibition.schema.json";
import useExtendedSchema from "../state/useExtendedSchema";
import { useSettings } from "../state/useLocalSettings";
import {
  defaultJsonldContext,
  defaultPrefix,
  sladb,
  slent,
} from "./formConfigs";
import NewSemanticJsonForm from "./SemanticJsonForm";
import { oxigraphCrudOptions } from "@slub/remote-query-implementations";

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
  const typeName = "Exhibition";
  const loadedSchema = useExtendedSchema({ typeName, classIRI });

  return (
    <NewSemanticJsonForm
      data={data}
      onChange={setData}
      entityIRI={data["@id"]}
      typeIRI={classIRI}
      defaultPrefix={defaultPrefix}
      searchText={""}
      shouldLoadInitially
      jsonldContext={defaultJsonldContext}
      schema={loadedSchema as JSONSchema7}
      jsonFormsProps={{}}
    />
  );
};
export const SemanticJsonFormExhibition = () => {
  const [data, setData] = useState<any>(exampleData);
  /*
  button("generate random entry", () => {
    // @ts-ignore
    setData(JSONSchemaFaker.generate(exhibitionSchema));
  });
*/
  return (
    <QueryClientProvider client={queryClient}>
      <SemanticJsonFormOneShot />
    </QueryClientProvider>
  );
};
export default {
  title: "form/exhibition/EditExhibitionJSONForm",
  component: NewSemanticJsonForm,
};
