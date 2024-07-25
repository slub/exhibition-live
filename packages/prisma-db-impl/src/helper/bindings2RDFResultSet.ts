import { BindingValue, CountValue } from "../types";
import isNil from "lodash/isNil";
import uniq from "lodash/uniq";
import { bindingValue2RDFLiteral } from "./bindingValue2RDFLiteral";

/**
 * Convert bindings to a compliant RDF result set
 *
 * @param bindings a simple key value dictionary
 */
export const bindings2RDFResultSet = (
  bindings: Record<string, BindingValue | null | undefined>[],
) => {
  const bindingsFiltered = bindings.map((binding) =>
    Object.entries(binding).filter(([_, v]) => !isNil(v)),
  );

  const bindingsNew = bindingsFiltered.map((bindingFiltered) =>
    bindingFiltered.flatMap(([k, v]) => {
      if (k === "_count") {
        return Object.entries(v as unknown as CountValue).map(([k2, v2]) => [
          `${k2}_count`,
          bindingValue2RDFLiteral(v2 as BindingValue),
        ]);
      }
      if (k === "id") {
        return [["entity", { value: String(v), type: "uri" }]];
      }
      const rdfLiteral = bindingValue2RDFLiteral(v as BindingValue);
      if (rdfLiteral) {
        return [[`${k}_single`, rdfLiteral]];
      }
      return [];
    }),
  );
  const vars = uniq(bindingsNew.flatMap((e) => e.map(([k, _]) => k)));

  return {
    head: { vars },
    results: { bindings: bindingsNew.map((b) => Object.fromEntries(b)) },
  };
};
