import { ComponentMeta } from "@storybook/react";
import React, { useState } from "react";

import { SemanticJsonFormNoOps } from "./SemanticJsonFormNoOps";
import { bringDefinitionToTop } from "../utils/core";
import { addressSchema } from "../../fixtures/schema";
import { JSONSchema7 } from "json-schema";
import { sladb } from "./formConfigs";

export default {
  title: "form/generic/SemanticJsonFormNoOps",
  component: SemanticJsonFormNoOps,
} as ComponentMeta<typeof SemanticJsonFormNoOps>;

const schema = bringDefinitionToTop(addressSchema, "Address");
export const SemanticJsonFormNoOpsDefault = () => {
  const [data, setData] = useState({});

  return (
    <SemanticJsonFormNoOps
      data={data}
      onChange={setData}
      schema={schema as JSONSchema7}
      typeIRI={sladb.Address.value}
      forceEditMode={true}
    />
  );
};
