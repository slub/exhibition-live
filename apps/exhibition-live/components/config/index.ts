export const BASE_IRI = "http://ontologies.slub-dresden.de/exhibition#";
export const API_URL = "http://sdvahndmgtest.slub-dresden.de:8000/graphql";

export const PUBLIC_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export * from "./lobidMappings";
export * from "./primaryFields";
export * from "./permissions";
export * from "./typeIRIToTypeName";
