import { isValidUrl } from "@slub/edb-core-utils";
import { BindingValue } from "../types";

/**
 * Convert a binding value to an RDF literal
 * Not an elegant way to do this, but it works for now
 * In future we should use the json schema to determine the type of the value
 *
 * Function is currently used to mimic the behavior
 * of the SPARQL endpoint for data sources like the prisma store or external APIs
 *
 * @param value
 */
export const bindingValue2RDFLiteral = (value: BindingValue) => {
  // { value: "t": type: "literal", }
  if (typeof value === "string") {
    if (isValidUrl(value)) {
      return { value, type: "uri" };
    } else {
      return { value, type: "literal" };
    }
  } else if (typeof value === "number") {
    //float or integer
    if (Number.isInteger(value)) {
      return {
        value: String(value),
        type: "literal",
        datatype: "http://www.w3.org/2001/XMLSchema#integer",
      };
    } else {
      return {
        value: String(value),
        type: "literal",
        datatype: "http://www.w3.org/2001/XMLSchema#float",
      };
    }
  } else if (typeof value === "boolean") {
    return {
      value: String(value),
      type: "literal",
      datatype: "http://www.w3.org/2001/XMLSchema#boolean",
    };
  }
  return null;
};
