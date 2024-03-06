import DeepGraphToJSONShowcase from "./DeepGraphToJSONShowcase";

export default {
  title: "form/exhibition/DeepGraphToJSONShowcase",
  component: DeepGraphToJSONShowcase,
}

export const DeepGraphToJSONShowcaseDefault = () => {
  return (
    <DeepGraphToJSONShowcase
      omitEmptyArrays={true}
      omitEmptyObjects={true}
      maxRecursion={5}
      maxRecursionEachRef={2}
      skipAtLevel={2}
    />
  );
};
