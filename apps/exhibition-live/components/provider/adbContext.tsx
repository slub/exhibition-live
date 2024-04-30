import { createContext, useContext } from "react";
import {
  SparqlBuildOptions,
  SparqlEndpoint,
  StringToIRIFn,
} from "@slub/edb-core-types";
import { JsonLdContext } from "jsonld-context-parser";

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
  createEntityIRI: (typeName: string, id?: string) => string;
  lockedSPARQLEndpoint?: SparqlEndpoint;
  jsonLDConfig: JSONLDConfig;
};

type EdbGlobalContextProps = AdbContextValue & {
  children: React.ReactNode;
};

export const AdbContext = createContext<AdbContextValue>(null);

export const AdbProvider = ({ children, ...rest }: EdbGlobalContextProps) => {
  return <AdbContext.Provider value={rest}>{children}</AdbContext.Provider>;
};

export const useAdbContext = () => useContext(AdbContext);
