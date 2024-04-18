import { XMLParser } from "fast-xml-parser";

import { SearchRetrieveResponseTypes } from "./searchRetrieveResponse-types";
import { KXPEntry } from "./types";
import { marcRecord2KXPEntry } from "./marcRecord2KXPEntry";

export const findEntityWithinK10Plus = async (
  searchString: string,
  typeName: string,
  endpointURL: string,
  limit?: number,
  recordSchema?: string,
): Promise<KXPEntry[] | undefined> => {
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
  const result = parser.parse(res) as SearchRetrieveResponseTypes;
  if (!result?.searchRetrieveResponse) return;
  const mappedFields = result.searchRetrieveResponse.records?.record?.map(
    (record) => marcRecord2KXPEntry(record),
  );
  return mappedFields;
};
