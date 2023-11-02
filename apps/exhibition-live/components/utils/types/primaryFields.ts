export type PrimaryField = Partial<{
  label: string;
  description: string;
  image: string;
}>;
export type PrimaryFieldDeclaration = {
  [typeName: string]: PrimaryField;
};
