import { JsonLdContext } from "jsonld-context-parser";
import { create } from "zustand";
import {
  defaultJsonldContext,
  defaultPrefix,
  defaultQueryBuilderOptions,
} from "../form/formConfigs";
import { NamespaceBuilderPrefixes } from "@slub/edb-core-types";

export type UseGlobalSettingsState = {
  defaultPrefix: string;
  jsonldContext?: JsonLdContext;
  namespacePrefixes: NamespaceBuilderPrefixes;
  allowUnsafeSourceIRIs?: boolean;
};

export const useGlobalSettings = create<UseGlobalSettingsState>(() => ({
  defaultPrefix: defaultPrefix,
  jsonldContext: defaultJsonldContext,
  namespacePrefixes: defaultQueryBuilderOptions,
  allowUnsafeSourceIRIs: false,
}));
