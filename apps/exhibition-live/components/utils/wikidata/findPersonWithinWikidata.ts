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

const findPersonWithinWikidata = async (
  searchString: string,
  limit?: number,
  typeOf: string = "Q5",
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

type WikidataRESTResult = {
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

export const findPersonWithinWikidataUsingREST = async (
  searchString: string,
  limit?: number,
  typeOf: string = "Q5",
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

export default findPersonWithinWikidata;
