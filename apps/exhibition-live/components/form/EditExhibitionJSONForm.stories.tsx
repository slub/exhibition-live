import { QueryClient, QueryClientProvider } from "@slub/edb-state-hooks";
import { JSONSchema7 } from "json-schema";
import { useMemo, useState } from "react";

import {
  defaultJsonldContext,
  defaultPrefix,
  sladb,
  slent,
} from "../config/formConfigs";
import NewSemanticJsonForm from "./SemanticJsonFormOperational";
import { useExtendedSchema } from "@slub/edb-state-hooks";
import { uischemata } from "../config/uischemata";

const queryClient = new QueryClient();

const classIRI = sladb.Exhibition.value;
const exampleData = {
  "@id": slent["Exhibition#s-12"].value,
  "@type": classIRI,
  title: "Otto Dix Ausstellung",
};

const SemanticJsonFormOneShot = () => {
  const [data, setData] = useState<any>(exampleData);
  const typeName = "Exhibition";
  const loadedSchema = useExtendedSchema({ typeName });
  const uischema = useMemo(() => uischemata?.[typeName], [typeName]);

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
      jsonFormsProps={{
        uischema,
      }}
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
