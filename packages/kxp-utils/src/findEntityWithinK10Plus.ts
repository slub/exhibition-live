import { XMLParser } from "fast-xml-parser";

import { marcRecord2RootNode } from "./marcRecord2RootNode";
import { MarcResponseTypes } from "@slub/edb-marc-to-rdf";
import { RootNode } from "@slub/edb-graph-traversal";

export const findEntityWithinK10Plus = async (
  searchString: string,
  typeName: string,
  endpointURL: string,
  limit?: number,
  recordSchema?: string,
): Promise<RootNode[] | undefined> => {
  let rawResponse;
  const recordSchemaString = recordSchema
    ? `&recordSchema=${encodeURIComponent(recordSchema)}`
    : "";
  try {
    rawResponse = await fetch(
      `${endpointURL}?version=1.1&query=pica.all%3D${encodeURIComponent(
        searchString,
      )}&operation=searchRetrieve&maximumRecords=${limit}${recordSchemaString}`,
    );
  } catch (e) {
    console.error("Error fetching from K10Plus", e);
    return;
  }
  const res = await rawResponse.text();
  const parser = new XMLParser({
    ignoreAttributes: false,
    removeNSPrefix: true,
  });
  const result = parser.parse(res) as MarcResponseTypes;
  if (!result?.searchRetrieveResponse) return;
  const mappedFields = result.searchRetrieveResponse.records?.record?.map(
    (record) => marcRecord2RootNode(record),
  );
  return mappedFields;
};
