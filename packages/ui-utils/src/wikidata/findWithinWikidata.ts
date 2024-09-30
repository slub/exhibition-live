import { get } from "lodash";
import {
  CommonPropertyValues,
  getCommonPropsFromWikidata,
} from "./getCommonPropsFromWikidata";

export type WikidataSearchOptions = {
  srsearch: {
    searchString: string;
    haswbstatement?: string[][];
  };
  prop?: string[];
  srprop?: string[];
  srlimit?: number;
};

export type WikidataFlatSearchParams = {
  action: "query";
  srsearch: string;
  origin: string;
  utf8?: "";
  format: string;
  srprop?: string;
  srlimit?: string;
  list: "search";
  prop?: string;
};

const buildHaswbstatement = (statementAND_OR: string[][]) =>
  statementAND_OR.map((sAND) => `haswbstatement:${sAND.join("|")}`).join(" ");

export const wikidataSearchOptionsToParams: (
  options: WikidataSearchOptions,
) => WikidataFlatSearchParams = ({ srsearch, srprop, prop, srlimit }) => ({
  action: "query",
  list: "search",
  origin: "*",
  utf8: "",
  format: "json",
  srsearch:
    srsearch.searchString +
    (srsearch.haswbstatement
      ? " " + buildHaswbstatement(srsearch.haswbstatement)
      : ""),
  ...(srprop ? { srprop: srprop.join("|") } : {}),
  ...(prop ? { prop: prop.join("|") } : {}),
  ...(srlimit ? { srlimit: Math.floor(srlimit).toString() } : {}),
});

const wikidataApiURL = "https://www.wikidata.org/w/api.php";
const wikidataRestAPIURL = "https://www.wikidata.org/w/rest.php/v1/search/page";

export const buildWikidataFulltextSearchRestParams: (
  searchString: string,
  haswbstatement: string[][],
  limit?: number,
) => URLSearchParams = (searchString, haswbstatement, limit) =>
  new URLSearchParams({
    q: `${searchString} ${buildHaswbstatement(haswbstatement)}`,
    limit: Math.floor(limit || 10).toString(),
  });

export const buildWikidataFulltextSearchParams: (
  searchString: string,
  haswbstatement: string[][],
  limit?: number,
) => URLSearchParams = (searchString, haswbstatement, srlimit) =>
  new URLSearchParams(
    wikidataSearchOptionsToParams({
      srprop: [
        "size",
        "wordcount",
        "timestamp",
        "sectiontitle",
        "snippet",
        "titlesnippet",
      ],
      srsearch: {
        haswbstatement: haswbstatement,
        searchString,
      },
      srlimit,
    }),
  );

export type WikidataSearchResult = {
  search: {
    snippet: string;
    wordcount: number;
    titlesnippet: string;
    size: number;
    ns: number;
    title: string;
    pageid: number;
    timestamp: string;
  }[];
  searchinfo: { totalhits: number };
};

const findWithinWikidata = async (
  searchString: string,
  typeOf: string,
  limit?: number,
) => {
  const result = await fetch(
    `${wikidataApiURL}?${buildWikidataFulltextSearchParams(
      searchString,
      [[`P31=${typeOf}`]],
      limit,
    )}`,
  ).then((res) => res.json());

  return result.query as WikidataSearchResult;
};

export type WikidataRESTResult = {
  pages: {
    thumbnail: {
      duration: number | null;
      size: null;
      width: number;
      mimetype: string;
      url: string;
      height: number;
    };
    matched_title: string | null;
    description: string | null;
    id: number;
    title: string;
    excerpt: string;
    key: string;
  }[];
};

export const findWithinWikidataUsingREST: (
  searchString: string,
  typeOf?: string,
  limit?: number,
) => Promise<WikidataRESTResult["pages"]> = async (
  searchString: string,
  typeOf: string = "Q5",
  limit?: number,
) => {
  const result = await fetch(
    `${wikidataRestAPIURL}?${buildWikidataFulltextSearchRestParams(
      searchString,
      [[`P31=${typeOf}`]],
      limit,
    )}`,
  ).then((res) => res.json());

  return (result as WikidataRESTResult).pages;
};

export const getWDIDFromIRI = (iri: string) => {
  return iri.replace("http://www.wikidata.org/entity/", "");
};

const stripWikidataPrefixFromProps = (allProps: CommonPropertyValues) => {
  return Object.fromEntries(
    Object.entries(allProps).map(([key, value]) => {
      const strippedKey = getWDIDFromIRI(key);
      return [strippedKey, value];
    }),
  ) as CommonPropertyValues;
};

export const filterRank = (entity: any, rank: "preferred" | "normal") => {
  return {
    ...entity,
    claims: Object.fromEntries(
      Object.entries(entity.claims).map(([key, claims]) => {
        const filtered = (claims as any[]).filter(
          (claim) => claim?.rank === rank,
        );
        return [key, filtered.length > 0 ? filtered : claims];
      }),
    ),
  };
};

export const getEntityFromWikidataByIRI: (
  iri: string,
  options: { rank?: "preferred" | "normal" },
) => Promise<any> = (iri: string, options) => {
  const url = new URL(wikidataApiURL);
  const id = getWDIDFromIRI(iri);
  url.search = new URLSearchParams({
    action: "wbgetentities",
    format: "json",
    ids: id,
    origin: "*",
  }).toString();
  return fetch(url.toString())
    .then((res) => res.json())
    .then((res) =>
      options?.rank
        ? filterRank(res.entities[id], options.rank)
        : res.entities[id],
    );
};

export const findEntitiesCommonPropsWithinWikidataByIRI = async (
  iri: string,
) => {
  console.log("findEntitiesCommonPropsWithinWikidataByIRI", iri);

  return getCommonPropsFromWikidata(
    iri,
    ["https://query.wikidata.org/sparql"],
    true,
  ).then((allProps_) => {
    const allProps = stripWikidataPrefixFromProps(allProps_);
    return allProps;
  });
};

export default findWithinWikidata;
