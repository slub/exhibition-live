import { createContext, useContext } from "react";
import {
  JsonFormsUISchemaRegistryEntry,
  JsonFormsRendererRegistryEntry,
  JsonFormsCellRendererRegistryEntry,
} from "@jsonforms/core";
import {
  IRIToStringFn,
  NormDataMapping,
  SparqlBuildOptions,
  SparqlEndpoint,
  StringToIRIFn,
} from "@slub/edb-core-types";
import { JsonLdContext } from "jsonld-context-parser";
import {
  EditEntityModalProps,
  EntityDetailModalProps,
  ModRouter,
  SemanticJsonFormProps,
} from "@slub/edb-global-types";
import { NiceModalHocProps } from "@ebay/nice-modal-react";
import { JSONSchema7 } from "json-schema";

export type JSONLDConfig = {
  defaultPrefix: string;
  jsonldContext?: JsonLdContext;
  allowUnsafeSourceIRIs?: boolean;
};

/**
 * Context for the ADB
 *
 * @param queryBuildOptions Options passed to the query builder
 * @param typeNameToTypeIRI Mapping from type name within Schema to a class IRI
 * @param lockedSPARQLEndpoint Optional locked SPARQL endpoint
 */
type AdbContextValue = {
  queryBuildOptions: SparqlBuildOptions;
  typeNameToTypeIRI: StringToIRIFn;
  typeIRIToTypeName: IRIToStringFn;
  createEntityIRI: (typeName: string, id?: string) => string;
  propertyNameToIRI: StringToIRIFn;
  propertyIRIToPropertyName: IRIToStringFn;
  lockedSPARQLEndpoint?: SparqlEndpoint;
  jsonLDConfig: JSONLDConfig;
  normDataMapping: {
    [authorityIRI: string]: NormDataMapping;
  };
  schema: JSONSchema7;
  uiSchemaDefaultRegistry?: JsonFormsUISchemaRegistryEntry[];
  rendererRegistry?: JsonFormsRendererRegistryEntry[];
  primaryFieldRendererRegistry?: (
    typeIRI: string,
  ) => JsonFormsRendererRegistryEntry[];
  cellRendererRegistry?: JsonFormsCellRendererRegistryEntry[];
  env: {
    publicBasePath: string;
    baseIRI: string;
  };
  components: {
    EditEntityModal: React.FC<EditEntityModalProps & NiceModalHocProps>;
    EntityDetailModal: React.FC<EntityDetailModalProps & NiceModalHocProps>;
    SemanticJsonForm: React.FC<SemanticJsonFormProps>;
  };
  useRouterHook: () => ModRouter;
};

type EdbGlobalContextProps = AdbContextValue & {
  children: React.ReactNode;
};

export const AdbContext = createContext<AdbContextValue>(null);

export const AdbProvider = ({ children, ...rest }: EdbGlobalContextProps) => {
  return <AdbContext.Provider value={rest}>{children}</AdbContext.Provider>;
};

export const useAdbContext = () => useContext(AdbContext);
