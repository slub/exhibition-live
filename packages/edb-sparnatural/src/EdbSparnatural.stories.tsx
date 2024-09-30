import { Meta, StoryObj } from "@storybook/react";
import { EdbSparnatural } from "./EdbSparnatural";

const meta: Meta<typeof EdbSparnatural> = {
  component: EdbSparnatural,
  title: "Components/EdbSparnatural",
};

export default meta;
type Story = StoryObj<typeof EdbSparnatural>;

export const Default: Story = {
  args: {
    src: "https://sparnatural.eu/demos/demo-dbpedia-v2/sparnatural-config.ttl",
    lang: "en",
    endpoint: "https://fr.dbpedia.org/sparql",
    distinct: "true",
    limit: "100",
    prefix:
      "skos:http://www.w3.org/2004/02/skos/core# rico:https://www.ica.org/standards/RiC/ontology#",
    debug: "true",
  },
};

export const WithCustomEndpoint: Story = {
  args: {
    src: "./schema/Exhibition.schema_shape_ai.ttl",
    lang: "en",
    endpoint: "http://localhost:7878/query",
    distinct: "true",
    limit: "100",
    prefix: "sladb:http://ontologies.slub-dresden.de/exhibition#",
  },
};
