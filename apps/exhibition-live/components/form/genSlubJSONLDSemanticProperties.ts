import namespace from "@rdfjs/namespace";
import {GenJSONLDSemanticPropertiesFunction} from "@slub/json-schema-utils";

export const sladb = namespace("http://ontologies.slub-dresden.de/exhibition#");
export const slent = namespace(
  "http://ontologies.slub-dresden.de/exhibition/entity#",
);
const makeGenSlubJSONLDSemanticProperties: (
  baseIRI: string,
  entitytBaseIRI: string,
) => GenJSONLDSemanticPropertiesFunction =
  (baseIRI: string, entityBaseIRI: string) => (modelName: string) => ({
    "@type": {
      const: `${baseIRI}${modelName.replace(/Stub$/, "")}`,
      type: "string",
    },
    "@id": {
      title: entityBaseIRI,
      type: "string",
    },
    image: {
      title: "Bild",
      type: "string",
    },
    idAuthority: {
      title: "Autorität",
      type: "object",
      properties: {
        "@id": {
          title: "IRI",
          type: "string",
        }
      }
    },
  });

export default makeGenSlubJSONLDSemanticProperties(
  sladb[""].value,
  slent[""].value,
);
