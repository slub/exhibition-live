import { findEntityWithinLobidByIRI } from "@slub/edb-authorities";
import { AuthorityConfiguration } from "@slub/edb-data-mapping";
import { getEntityFromWikidataByIRI } from "@slub/edb-ui-utils";

export const authorityAccess: Record<string, AuthorityConfiguration> = {
  "http://d-nb.info/gnd": {
    authorityIRI: "http://d-nb.info/gnd",
    getEntityByIRI: findEntityWithinLobidByIRI,
  },
  "http://www.wikidata.org": {
    authorityIRI: "http://www.wikidata.org",
    getEntityByIRI: async (id) =>
      await getEntityFromWikidataByIRI(id, { rank: "preferred" }),
  },
};
