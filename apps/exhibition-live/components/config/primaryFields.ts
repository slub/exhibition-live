import kulinarik from "../../public/schema/Kulinarik.schema.json";
import {
  PrimaryField,
  PrimaryFieldDeclaration,
  PrimaryFieldExtractDeclaration,
} from "@slub/edb-core-types";

type KulinarikPrimaryFieldDeclaration = PrimaryFieldDeclaration<
  keyof typeof kulinarik.$defs
>;

type KulinarikPrimaryFieldExtractDeclaration = PrimaryFieldExtractDeclaration<
  any,
  keyof typeof kulinarik.$defs
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
  Person: {
    label: "name",
  },
  Festmahl: {
    label: "anlass",
  },
  Essen: {
    label: "title",
  },
  Rezept: defaultMapping,
};

export const primaryFieldExtracts: Partial<KulinarikPrimaryFieldExtractDeclaration> =
  primaryFields;
