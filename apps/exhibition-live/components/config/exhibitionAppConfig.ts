import {
  createNewIRI,
  defaultJsonldContext,
  defaultPrefix,
  defaultQueryBuilderOptions,
  sladb,
} from "./formConfigs";
import { BASE_IRI } from "./paths";
import { declarativeMappings, lobidTypemap } from "./lobidMappings";
import { schema } from "@slub/exhibition-schema";
import { JSONSchema7 } from "json-schema";
import { makeStubSchema } from "./makeStubSchema";
import { makeDefaultUiSchemaForAllDefinitions } from "./makeDefaultUiSchemaForAllDefinitions";
import { rendererRegistry } from "./rendererRegistry";
import { materialCells } from "@jsonforms/material-renderers";
import { primaryFieldsRegistry } from "./primaryFieldsRegistry";

export const exhibitionConfig = {
  queryBuildOptions: defaultQueryBuilderOptions,
  typeNameToTypeIRI: (name: string) => sladb(name).value,
  propertyNameToIRI: (name: string) => sladb(name).value,
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
      mapping: declarativeMappings,
      typeToTypeMap: lobidTypemap,
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
    primaryFieldsRegistry(typeIRI, (name: string) => sladb(name).value),
};
