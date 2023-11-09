import exhibitionSchema from "../../public/schema/Exhibition.schema.json";
import { PrimaryField } from "../utils/types";

type ExhibitionPrimaryFieldDeclaration = {
  //typeof keys of exhibitionSchema.$defs
  [typeName in keyof typeof exhibitionSchema.$defs]: PrimaryField;
};

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
  Exhibition: defaultMappingWithImg,
  Tag: defaultMapping,
  Person: {
    ...defaultMapping,
    label: "name",
  },
  Corporation: {
    ...defaultMapping,
    label: "name",
  },
  ExhibitionExponat: defaultMappingWithImg,
  Genre: defaultMapping,
  Place: defaultMappingWithImg,
  Location: defaultMappingWithImg,
  CorporationRole: defaultMapping,
  PersonRole: defaultMapping,
  ExhibitionCategory: defaultMapping,
  ExhibitionSeries: defaultMapping,
  EventType: defaultMapping,
  Resource: defaultMapping,
  ExhibitionCategory: {
    ...defaultMapping,
    label: "name",
  },
};
