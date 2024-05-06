import dynamic from "next/dynamic";
import type { YasguiSPARQLEditorProps } from "./YasguiSPARQLEditor";

const DynamicComponentWithNoSSR = dynamic(
  () => import("./YasguiSPARQLEditor"),
  {
    ssr: false,
  },
);

export const YasguiSPARQLEditorNoSSR = (props: YasguiSPARQLEditorProps) => (
  <DynamicComponentWithNoSSR {...props} />
);
