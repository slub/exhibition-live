import { Meta, StoryObj } from "@storybook/react";
import { SimilarityFinder } from "./SimilarityFinder";

export default {
  title: "ui/similarity-finder/SimilarityFinder",
  component: SimilarityFinder,
} as Meta<typeof SimilarityFinder>;

type Story = StoryObj<typeof SimilarityFinder>;

export const Primary: Story = {
  args: {
    finderId: "finder-1",
    data: {},
    classIRI: "http://ontologies.slub-dresden.de/exhibition#Person",
    onEntityIRIChange: (iri) => console.log(`Entity IRI Changed: ${iri}`),
    onExistingEntityAccepted: (iri, data) =>
      console.log(`Existing Entity Accepted: ${iri}, Data: ${data}`),
    onMappedDataAccepted: (data) =>
      console.log(`Mapped Data Accepted: ${data}`),
    search: "Otto Dix",
    jsonSchema: {},
    hideFooter: false,
    additionalKnowledgeSources: ["wikidata"],
    searchOnDataPath: "path.to.search",
  },
};
