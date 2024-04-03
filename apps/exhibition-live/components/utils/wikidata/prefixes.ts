/*
PREFIX bd: <http://www.bigdata.com/rdf#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX schema: <http://schema.org/>
PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wikibase: <http://wikiba.se/ontology#>
PREFIX wds: <http://www.wikidata.org/entity/statement/>
PREFIX wdv: <http://www.wikidata.org/value/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX p: <http://www.wikidata.org/prop/>
PREFIX ps: <http://www.wikidata.org/prop/statement/>
 */
import { Prefixes } from "@slub/edb-core-types";

export const wikidataPrefixes: Prefixes = {
  bd: "http://www.bigdata.com/rdf#",
  rdfs: "http://www.w3.org/2000/01/rdf-schema#",
  schema: "http://schema.org/",
  wd: "http://www.wikidata.org/entity/",
  wikibase: "http://wikiba.se/ontology#",
  wdt: "http://www.wikidata.org/prop/direct/",
};
