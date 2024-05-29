import { createContext, useContext } from "react";
import { JsonLdContext } from "jsonld-context-parser";
import {
  EditEntityModalProps,
  EntityDetailModalProps,
  GlobalAppConfig,
  ModRouter,
  SemanticJsonFormProps,
} from "@slub/edb-global-types";
import { NiceModalHocProps } from "@ebay/nice-modal-react";
import { SparqlEndpoint } from "@slub/edb-core-types";

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
 * @param useRouterHook Pass the hook needed for your framework specific routing (next router, react-router-dom,...)
 */
type AdbContextValue = GlobalAppConfig & {
  lockedSPARQLEndpoint?: SparqlEndpoint;
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
