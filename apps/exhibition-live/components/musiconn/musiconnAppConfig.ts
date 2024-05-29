import {
  createNewIRI,
  defaultJsonldContext,
  defaultPrefix,
  defaultQueryBuilderOptions,
  slmus,
} from "./formConfigs";
import { BASE_IRI } from "./paths";
import { schema } from "@slub/musiconn-schema";
import { makeStubSchema } from "./makeStubSchema";
import { makeDefaultUiSchemaForAllDefinitions } from "./makeDefaultUiSchemaForAllDefinitions";
import { rendererRegistry } from "./rendererRegistry";
import { materialCells } from "@jsonforms/material-renderers";
import { primaryFieldsRegistry } from "./primaryFieldsRegistry";
import { JSONSchema7 } from "json-schema";

export const musiconnConfig = {
  queryBuildOptions: defaultQueryBuilderOptions,
  typeNameToTypeIRI: (name: string) => slmus(name).value,
  propertyNameToIRI: (name: string) => slmus(name).value,
  typeIRIToTypeName: (iri: string) =>
    iri?.substring(BASE_IRI.length, iri.length),
  propertyIRIToPropertyName: (iri: string) =>
    iri?.substring(BASE_IRI.length, iri.length),
  createEntityIRI: createNewIRI,
  jsonLDConfig: {
    defaultPrefix: defaultPrefix,
    jsonldContext: defaultJsonldContext,
    allowUnsafeSourceIRIs: false,
  },
  normDataMapping: {
    gnd: {
      mapping: {},
      typeToTypeMap: {},
    },
  },
  schema: schema as JSONSchema7,
  makeStubSchema: makeStubSchema,
  uiSchemaDefaultRegistry: makeDefaultUiSchemaForAllDefinitions(
    schema as JSONSchema7,
  ),
  rendererRegistry: rendererRegistry,
  cellRendererRegistry: materialCells,
  primaryFieldRendererRegistry: (typeIRI: string) =>
    primaryFieldsRegistry(typeIRI, (iri: string) =>
      iri?.substring(BASE_IRI.length, iri.length),
    ),
};
