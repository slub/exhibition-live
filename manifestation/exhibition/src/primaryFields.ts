import {
  PrimaryField,
  PrimaryFieldDeclaration,
  PrimaryFieldExtractDeclaration,
} from "@slub/edb-core-types";
import { schema } from "./schema";
import { defs } from "@slub/json-schema-utils";

type ExhibitionPrimaryFieldDeclaration = PrimaryFieldDeclaration<string>;

type ExhibitionPrimaryFieldExtractDeclaration = PrimaryFieldExtractDeclaration<
  any,
  string
>;

const defaultMapping: PrimaryField = {
  label: "title",
  description: "description",
};

const defaultMappingWithImg: PrimaryField = {
  label: "title",
  description: "description",
  image: "image",
};

export const primaryFields: Partial<ExhibitionPrimaryFieldDeclaration> = {
  ...Object.fromEntries(
    Object.keys(defs(schema)).map((key) => [key, defaultMapping]),
  ),
  Exhibition: defaultMappingWithImg,
  Tag: defaultMappingWithImg,
  Person: {
    ...defaultMappingWithImg,
    label: "name",
  },
  Corporation: {
    ...defaultMapping,
    label: "name",
  },
  ExhibitionExponat: defaultMappingWithImg,
  Genre: defaultMappingWithImg,
  Place: defaultMappingWithImg,
  Location: defaultMappingWithImg,
  ExhibitionSeries: defaultMapping,
  ExhibitionCategory: {
    ...defaultMapping,
    label: "name",
  },
};

export const primaryFieldExtracts: Partial<ExhibitionPrimaryFieldExtractDeclaration> =
  {
    ...primaryFields,
    InvolvedPerson: {
      label: {
        path: "person.name",
      },
      description: {
        path: "role.title",
      },
      image: {
        path: "person.image",
      },
    },
    InvolvedCorporation: {
      label: {
        path: "corporation.name",
      },
      description: {
        path: "role.title",
      },
      image: {
        path: "corporation.image",
      },
    },
  };
