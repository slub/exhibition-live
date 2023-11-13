import dynamic from "next/dynamic";

const DynamicComponentWithNoSSR = dynamic(() => import("./TypedForm"), {
  ssr: false,
});
type MainFormProps = {
  typeName: string;
  entityIRI: string;
  classIRI: string;
};

// @ts-ignore
export default (props: MainFormProps) => (
  <DynamicComponentWithNoSSR {...props} />
);
