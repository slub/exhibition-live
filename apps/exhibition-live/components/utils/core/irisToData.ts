import { NamedAndTypedEntity } from "../crud";

export const irisToData = (
  entityIRI?: string,
  typeIRI?: string,
): Partial<NamedAndTypedEntity> => ({
  ...(entityIRI ? { "@id": entityIRI } : {}),
  ...(typeIRI ? { "@type": typeIRI } : {}),
});
