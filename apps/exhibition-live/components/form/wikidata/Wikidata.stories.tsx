import React from "react";
import { WikidataAllPropTable } from "@slub/edb-advanced-components";

import WikidataThingCard from "./WikidataThingCard";
import WikidataHumanCard from "./WikidataHumanCard";

export default {
  title: "ui/view/WikidataCard",
  component: WikidataThingCard,
};

export const WikidataThingCardDefault = () => (
  <WikidataThingCard thingIRI={"http://www.wikidata.org/entity/Q3"} />
);

export const WikidataThingCardCostaRica = () => (
  <WikidataThingCard thingIRI={"http://www.wikidata.org/entity/Q800"} />
);

export const WikidataHumanCardDschuong = () => (
  <WikidataHumanCard personIRI={"http://www.wikidata.org/entity/Q47739"} />
);

export const WikidateAllPropTableDschuang = () => (
  <WikidataAllPropTable thingIRI={"Q47739"} />
);
export const WikidataThingCardHuman = () => (
  <WikidataThingCard thingIRI={"http://www.wikidata.org/entity/Q5"} />
);
