import { filterJSONLD } from "./filterJSONLD";

/**
 * Used for logging and cli - simple helper function to format JSON results and optionally remove JSON-LD properties
 * @param result some JSON object
 * @param pretty whether to pretty print the JSON
 * @param noJsonLD whether to remove JSON-LD properties
 */
export const formatJSONResult = (
  result: object,
  pretty?: boolean,
  noJsonLD?: boolean,
) => {
  const res = noJsonLD ? filterJSONLD(result) : result;
  return pretty ? JSON.stringify(res, null, 2) : JSON.stringify(res);
};
