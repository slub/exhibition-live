import {
  PrimaryField,
  PrimaryFieldDeclaration,
  PrimaryFieldExtractDeclaration,
} from "@slub/edb-core-types";

type MusiconnPrimaryFieldDeclaration = PrimaryFieldDeclaration<string>;

type MusiconnPrimaryFieldExtractDeclaration = PrimaryFieldExtractDeclaration<
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

export const primaryFields: Partial<MusiconnPrimaryFieldDeclaration> = {
  Authority: defaultMapping,
  Corporation: defaultMapping,
  Event: defaultMapping,
  Location: defaultMapping,
  Performance: defaultMapping,
  Person: defaultMapping,
  Series: defaultMapping,
  Source: defaultMapping,
  Subject: defaultMapping,
  Work: defaultMapping,
};

export const primaryFieldExtracts: Partial<MusiconnPrimaryFieldExtractDeclaration> =
  {
    ...primaryFields,
  };
