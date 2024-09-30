import type Yasgui from "@triply/yasgui";
import { Prefixes } from "@slub/edb-core-types";

export type YasguiSPARQLEditorProps = {
  onInit?: (yasgu: Yasgui) => void;
  prefixes?: Prefixes;
};
