import { wikidataMappings, wikidataTypeMap } from "./wikidataMappings";
import { lobidMappings, lobidTypemap } from "./lobidMappings";
import { NormDataMappings } from "@slub/edb-core-types";

export const availableAuthorityMappings: NormDataMappings = {
  "http://www.wikidata.org": {
    label: "Wikidata",
    sameAsTypeMap: wikidataTypeMap,
    mapping: wikidataMappings,
  },
  "http://d-nb.info/gnd": {
    label: "GND",
    sameAsTypeMap: lobidTypemap,
    mapping: lobidMappings,
  },
} as const;
