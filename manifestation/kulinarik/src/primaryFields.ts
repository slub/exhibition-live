import {
  PrimaryField,
  PrimaryFieldDeclaration,
  PrimaryFieldExtractDeclaration,
} from "@slub/edb-core-types";

type KulinarikPrimaryFieldDeclaration = PrimaryFieldDeclaration<string>;

type KulinarikPrimaryFieldExtractDeclaration = PrimaryFieldExtractDeclaration<
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

export const primaryFields: Partial<KulinarikPrimaryFieldDeclaration> = {
  Kulinarik: defaultMappingWithImg,
};

export const primaryFieldExtracts: Partial<KulinarikPrimaryFieldExtractDeclaration> =
  {
    ...primaryFields,
  };
