---
to: manifestation/<%= name %>/src/primaryFields.ts
---
import {
  PrimaryField,
  PrimaryFieldDeclaration,
  PrimaryFieldExtractDeclaration,
} from "@slub/edb-core-types";

type <%= h.changeCase.pascalCase(name) %>PrimaryFieldDeclaration = PrimaryFieldDeclaration<string>;

type <%= h.changeCase.pascalCase(name) %>PrimaryFieldExtractDeclaration = PrimaryFieldExtractDeclaration<
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

export const primaryFields: Partial<<%= h.changeCase.pascalCase(name) %>PrimaryFieldDeclaration> = {
  <%= h.changeCase.pascalCase(name) %>: defaultMappingWithImg,
};

export const primaryFieldExtracts: Partial<<%= h.changeCase.pascalCase(name) %>PrimaryFieldExtractDeclaration> =
  {
    ...primaryFields,
  };
