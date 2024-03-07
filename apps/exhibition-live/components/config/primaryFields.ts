import exhibitionSchema from "../../public/schema/Exhibition.schema.json";
import { PrimaryField, PrimaryFieldExtract } from "../utils/types";

type ExhibitionPrimaryFieldDeclaration = {
  //typeof keys of exhibitionSchema.$defs
  [typeName in keyof typeof exhibitionSchema.$defs]: PrimaryField;
};

type ExhibitionPrimaryFieldExtractDeclaration = {
  //typeof keys of exhibitionSchema.$defs
  [typeName in keyof typeof exhibitionSchema.$defs]: PrimaryFieldExtract<any>;
}

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
  CorporationRole: defaultMapping,
  PersonRole: defaultMapping,
  ExhibitionSeries: defaultMapping,
  SeriesType: defaultMapping,
  EventType: defaultMapping,
  Resource: defaultMapping,
  Occupation: defaultMapping,
  ExhibitionCategory: {
    ...defaultMapping,
    label: "name",
  }
};

export const primaryFieldExtracts: Partial<ExhibitionPrimaryFieldExtractDeclaration> = {
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
    }
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
    }
  }
}
