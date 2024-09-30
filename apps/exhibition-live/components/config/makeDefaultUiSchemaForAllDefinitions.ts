import { JsonFormsUISchemaRegistryEntry } from "@jsonforms/core";

import { BASE_IRI } from "./index";
import { defs } from "@slub/json-schema-utils";
import { JSONSchema7 } from "json-schema";

const labels: Record<string, string> = {
  Person: "Person",
  Work: "Werk",
  Organization: "Organisation",
  Location: "Ort",
  Resource: "Ressource",
  ExhibitionType: "Ausstellungsart",
  GeographicLocation: "Geografischer Ort",
  ExhibitionSeries: "Ausstellungsreihe",
};

const additionalOptions: Record<string, any> = {
  EventType: {
    dropdown: true,
  },
  PersonRole: {
    dropdown: true,
  },
  CorporationRole: {
    dropdown: true,
  },
  ExhibitionCategory: {
    dropdown: true,
  },
  ResourceType: {
    dropdown: true,
  },
  SeriesType: {
    dropdown: true,
  },
};
export const createStubLayout = (
  defs: string,
  baseIRI: string,
  label?: string,
) => ({
  type: "VerticalLayout",
  elements: [
    {
      type: "Control",
      label: labels[defs] || label || defs,
      options: {
        inline: true,
        context: {
          $ref: `#/$defs/${defs}`,
          typeIRI: `${baseIRI}${defs}`,
          useModal: false,
        },
        ...(additionalOptions[defs] || {}),
      },
      scope: "#/properties/@id",
    },
    {
      type: "Control",
      scope: "#/properties/@type",
    },
  ],
});

const createUiSchema: (
  key: string,
  baseIRI: string,
  label?: string,
) => JsonFormsUISchemaRegistryEntry = (key, baseIRI, label) => ({
  tester: (schema) => {
    const rank =
      schema.properties?.["@type"]?.const === `${baseIRI}${key}` ? 21 : -1;
    return rank;
  },
  uischema: createStubLayout(key, baseIRI, label),
});

export const makeDefaultUiSchemaForAllDefinitions: (
  schema: JSONSchema7,
) => JsonFormsUISchemaRegistryEntry[] = (schema) =>
  Object.keys(defs(schema as JSONSchema7)).map((key) =>
    createUiSchema(key, BASE_IRI),
  );
