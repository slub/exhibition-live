import { describe, expect, test } from "@jest/globals";

import exampleData from "../../fixtures/lobid/documeta-1257120557.json";
import { mapByConfig } from "../utils/mapping/mapByConfig";
import { StrategyContext } from "../utils/mapping/mappingStrategies";
import { exhibitionDeclarativeMapping } from "./lobidMappings";

let i = 0;

const strategyContext: StrategyContext = {
  getPrimaryIRIBySecondaryIRI: async (
    secondaryIRI: string,
    authorityIRI: string,
    typeIRI: string,
  ) => {
    console.warn("using stub method");
    return null; //'http://example.com/1231231'
  },
  authorityIRI: "http://d-nb.info/gnd",
  newIRI: (typeIRI: string) => {
    console.warn("using stub method");
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
        title: "Documenta (15. : 2022 : Kassel)",
        titleVariant: [],
        toDate: 20220925,
        fromDate: 20220618,
        locations: [
          {
            "@id": "http://example.com/0",
            "@type": "http://ontologies.slub-dresden.de/exhibition#Location",
            title: "Kassel",
            idAuthority: "https://d-nb.info/gnd/4029869-3",
          },
        ],
      });
    });
  });
});
