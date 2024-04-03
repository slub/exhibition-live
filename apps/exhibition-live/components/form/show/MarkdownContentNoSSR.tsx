import dynamic from "next/dynamic";

const DynamicComponentWithNoSSR = dynamic(() => import("./MarkdownContent"), {
  ssr: false,
});

export type MarkdownContentProps = {
  mdDocument: string;
};

export default (props: MarkdownContentProps) => (
  <DynamicComponentWithNoSSR {...props} />
);
