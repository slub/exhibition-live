import { gndBaseIRI } from "../gnd";
import fetch from "cross-fetch";

/**
 * {
 *                     url: "http://lobid.org/gnd/search",
 *                     dataType: "jsonp",
 *                     data: {
 *                         q: request.term,
 *                         filter: "type:Person",
 *                         size: 25,
 *                         format: "json:suggest"
 *                     }
 * @param searchString
 * @param typeName
 * @param limit
 */
const lobidSearchURL = "https://lobid.org/gnd/search";
const lobidURL = "https://lobid.org/gnd/";

const mapTypeName = (
  typeName: string,
  lobidTypemap: Record<string, string | string[]>,
) => {
  const gndType = lobidTypemap[typeName] || typeName;
  return Array.isArray(gndType) ? gndType : [gndType];
};

const makeTypeFilter = (gndTypes: string[]) => {
  return gndTypes.map((gndType) => `type:${gndType}`).join(" OR ");
};
const gndIRIToID = (iri: string) => {
  const searchString = "d-nb.info/gnd/";
  const index = iri.indexOf(searchString);
  if (index === -1) {
    throw new Error(`invalid IRI: ${iri}`);
  }
  return iri.slice(index + searchString.length);
};
export const findEntityWithinLobid = async (
  searchString: string,
  typeName: string,
  lobidTypeMap: Record<string, string | string[]>,
  limit?: number,
  format?: string,
) => {
  try {
    const res = await fetch(
      lobidSearchURL +
        "?" +
        new URLSearchParams({
          q: searchString,
          filter: makeTypeFilter(mapTypeName(typeName, lobidTypeMap)),
          size: (limit || 10).toString(),
          format: format || "json",
        }).toString(),
    );
    return await res.json();
  } catch (e) {
    console.error("error while querying lobid", e);
    return [];
  }
};

export const findEntityWithinLobidWithCertainProperty: (
  property: string,
  searchString: string | undefined,
  typeName: string,
  lobidTypeMap: Record<string, string | string[]>,
  limit?: number,
) => Promise<any> = async (
  property,
  searchString,
  typeName,
  lobidTypeMap,
  limit,
) => {
  const res = await fetch(
    lobidSearchURL +
      "?" +
      new URLSearchParams({
        ...(searchString ? { q: searchString } : {}),
        filter: `${makeTypeFilter(mapTypeName(typeName, lobidTypeMap))} AND _exists_:${property}`,
        size: (limit || 10).toString(),
        format: "json",
      }).toString(),
  );
  return await res.json();
};

export const findEntityWithinLobidByID = async (id: string) => {
  console.log("fetching", `${lobidURL}${id}.json`);
  const res = await fetch(`${lobidURL}${id}.json`);
  try {
    const result = await res.json();
    return result;
  } catch (e) {
    throw new Error(`cannot convert response to json: ${e}`);
  }
  return await res.json();
};

export const findEntityWithinLobidByIRI = async (iri: string) => {
  return await findEntityWithinLobidByID(gndIRIToID(iri));
};
