import React from "react";

import WikidataThingCard from "./WikidataThingCard";
import WikidataHumanCard from "./WikidataHumanCard";
import WikidateAllPropTable from "./WikidataAllPropTable";

export default {
  title: "form/wikidata/WikidataThingCard",
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
  <WikidateAllPropTable thingIRI={"Q47739"} />
);
export const WikidataThingCardHuman = () => (
  <WikidataThingCard thingIRI={"http://www.wikidata.org/entity/Q5"} />
);
