export type FieldExtractDeclaration<T = any> =
  | string
  | ((entry: T) => string)
  | { path: string };

export type PrimaryField = Partial<{
  label: string;
  description: string;
  image: string;
}>;
export type PrimaryFieldExtract<T> = Partial<{
  label: FieldExtractDeclaration;
  description: FieldExtractDeclaration;
  image: FieldExtractDeclaration;
}>;
export type PrimaryFieldDeclaration = {
  [typeName: string]: PrimaryField;
};

export type PrimaryFieldExtractDeclaration<T = any> = {
  [typeName: string]: PrimaryFieldExtract<T>;
};

export type PrimaryFieldResults<T> = {
  label: T | null;
  description: T | null;
  image: T | null;
};
