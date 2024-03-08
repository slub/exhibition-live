import { describe, expect, test } from "@jest/globals";

import exampleData from "../../fixtures/lobid/documeta-1257120557.json";
import rendevousData from "../../fixtures/lobid/1256926108.json";
import { mapByConfig } from "../utils/mapping/mapByConfig";
import { StrategyContext } from "../utils/mapping/mappingStrategies";
import { exhibitionDeclarativeMapping } from "./lobidMappings";

let i = 0;

const strategyContext: StrategyContext = {
  searchEntityByLabel: async (label: string, typeIRI: string) => {
    console.warn("using stub method");
    return null; //'http://example.com/1231231'
  },
  getPrimaryIRIBySecondaryIRI: async (
    secondaryIRI: string,
    authorityIRI: string,
    typeIRI: string,
  ) => {
    //console.warn("using stub method");
    return null; //'http://example.com/1231231'
  },
  authorityIRI: "http://d-nb.info/gnd",
  newIRI: (typeIRI: string) => {
    //console.warn("using stub method");
    return `http://example.com/${i++}`;
  },
};
describe("apply different mapping strategies", () => {
  test("can map simple exhibition", () => {
    const mappedData = mapByConfig(
      exampleData,
      { "@id": "http://example.com/testcase" },
      exhibitionDeclarativeMapping,
      strategyContext,
    );
    mappedData.then((data) => {
      expect(data).toStrictEqual({
        "@id": "http://example.com/testcase",
        idAuthority: { "@id": "https://d-nb.info/gnd/1257120557" },
        title: "Documenta (15. : 2022 : Kassel)",
        endDate: { dateValue: 20220925 },
        startDate: { dateValue: 20220618 },
        titleVariant: [
          "dOCUMENtA fifteen"
        ],
        locations: [
          {
            __draft: true,
            "@id": "http://example.com/0",
            "@type": "http://ontologies.slub-dresden.de/exhibition#Location",
            title: "Kassel",
            idAuthority: { "@id": "https://d-nb.info/gnd/4029869-3" },
          },
        ],
      });
    });
  });

  test("can map exhibition with organizer and involved person", () => {
    i = 0;
    const mappedData = mapByConfig(
      rendevousData,
      { "@id": "http://example.com/testcase" },
      exhibitionDeclarativeMapping,
      strategyContext,
    );
    mappedData.then((data) => {
      expect(data).toStrictEqual({
        "@id": "http://example.com/testcase",
        title: "Rendezvous! Gemeinsam für Europa! (Veranstaltung)",
        idAuthority: { "@id": "https://d-nb.info/gnd/1256926108" },
        endDate: { dateValue: 20180805 },
        startDate: { dateValue: 20180802 },
        titleVariant: [
          "Gemeinsames Landjugendtreffen (2018)"
        ],
        locations: [
          {
            "@id": "http://example.com/0",
            "@type": "http://ontologies.slub-dresden.de/exhibition#Location",
            __draft: true,
            title: "Besançon",
            idAuthority: { "@id": "https://d-nb.info/gnd/4005972-8" },
          },
        ],
        involvedCorporations: [
          {
            "@id": "http://example.com/1",
            "@type":
              "http://ontologies.slub-dresden.de/exhibition#InvolvedCorporation",
            __draft: true,
            role: {
              "@id": "http://ontologies.slub-dresden.de/exhibition/organizer",
            },
            corporation: {
              "@id": "http://example.com/2",
              "@type":
                "http://ontologies.slub-dresden.de/exhibition#Corporation",
              __draft: true,
              name: "Katholische Landjugendbewegung Deutschlands",
              idAuthority: {
                "@id": "https://d-nb.info/gnd/2015505-0",
              },
            },
          },
          {
            "@id": "http://example.com/3",
            "@type":
              "http://ontologies.slub-dresden.de/exhibition#InvolvedCorporation",
            __draft: true,
            role: {
              "@id": "http://ontologies.slub-dresden.de/exhibition/organizer",
            },
            corporation: {
              "@id": "http://example.com/4",
              "@type":
                "http://ontologies.slub-dresden.de/exhibition#Corporation",
              __draft: true,
              name: "Mouvement Rural de la Jeunesse Chrétienne",
              idAuthority: {
                "@id": "https://d-nb.info/gnd/4494135-3",
              },
            },
          },
        ],
      });
    });
  });
});
