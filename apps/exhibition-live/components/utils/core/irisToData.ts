export type NamedEntityData = {
  "@id": string;
  [key: string]: any;
};
export type NamedAndTypedEntity = NamedEntityData & {
  "@type": string;
};
export const irisToData = (
  entityIRI?: string,
  typeIRI?: string,
): Partial<NamedAndTypedEntity> => ({
  ...(entityIRI ? { "@id": entityIRI } : {}),
  ...(typeIRI ? { "@type": typeIRI } : {}),
});
