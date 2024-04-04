import { DatasetCore, Quad } from "@rdfjs/types";
import N3 from "n3";

export const dataset2NTriples: (
  ds: DatasetCore<Quad>,
) => Promise<string> = async (ds: DatasetCore<Quad>) => {
  const ntWriter = new N3.Writer({ format: "Turtle" });
  return ntWriter.quadsToString([...ds]).replaceAll("_:_:", "_:");
};
