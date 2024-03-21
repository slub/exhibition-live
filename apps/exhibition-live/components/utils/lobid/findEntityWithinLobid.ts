import { gndBaseIRI } from "../gnd/prefixes";
import { lobidTypemap } from "../../config";

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

const mapTypeName = (typeName: string) => {
    const gndType =  lobidTypemap[typeName] || typeName;
    return Array.isArray(gndType) ? gndType : [gndType]
};

const makeTypeFilter = (gndTypes: string[]) => {
    return gndTypes.map(gndType => `type:${gndType}`).join(' OR ')
}
const gndIRIToID = (iri: string) => iri.substring(gndBaseIRI.length);
export const findEntityWithinLobid = async (
  searchString: string,
  typeName: string,
  limit?: number,
) => {
  try {
    const res = await fetch(
      lobidSearchURL +
        "?" +
        new URLSearchParams({
          q: searchString,
          filter: makeTypeFilter( mapTypeName(typeName)),
          size: (limit || 10).toString(),
          format: "json",
        }).toString(),
    );
    return await res.json();
  } catch (e) {
    console.error("error while querying lobid", e);
    return [];
  }
};

export const findEntityWithinLobidWithCertainProperty = async (
  property: string,
  searchString: string | undefined,
  typeName: string,
  limit?: number,
) => {
  const res = await fetch(
    lobidSearchURL +
      "?" +
      new URLSearchParams({
        ...(searchString ? { q: searchString } : {}),
        filter: `${makeTypeFilter(mapTypeName(typeName))} AND _exists_:${property}`,
        size: (limit || 10).toString(),
        format: "json",
      }).toString(),
  );
  return await res.json();
};

export const findEntityWithinLobidByID = async (id: string) => {
  const res = await fetch(`${lobidURL}${id}.json`);
  return await res.json();
};

export const findEntityWithinLobidByIRI = async (iri: string) => {
  return await findEntityWithinLobidByID(gndIRIToID(iri));
};
