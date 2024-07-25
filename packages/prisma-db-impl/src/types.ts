export type PropertiesAndConnects = {
  id?: string;
  properties: Record<string, any>;
  connects: Record<string, { id: string } | { id: string }[]>;
};
export type CountValue = Record<string, number>;

export type BindingValue = string | number | boolean;
