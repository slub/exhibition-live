import dynamic from "next/dynamic";
import { YasguiSPARQLEditorProps } from "./YasguiSPARQLEditorProps";

const DynamicComponentWithNoSSR = dynamic(
  () => import("./YasguiSPARQLEditor"),
  {
    ssr: false,
  },
);

export const YasguiSPARQLEditorNoSSR = (props: YasguiSPARQLEditorProps) => (
  <DynamicComponentWithNoSSR {...props} />
);
