import {
  getI18nKey,
  JsonSchema,
  Translator,
  UISchemaElement,
} from "@jsonforms/core";

export const i18nHelper: (
  key: string,
  defaultValue: string | null,
  translator: Translator,
  element: UISchemaElement,
  path: string,
  resolvedSchema?: JsonSchema,
) => string | undefined = (
  key,
  defaultValue,
  translator,
  element,
  path,
  resolvedSchema,
) => {
  const value: string | undefined | null =
    ((resolvedSchema as any)?.[key] as string | undefined) || defaultValue;
  const i18nKey = getI18nKey(resolvedSchema, element, path, key);
  // @ts-ignore
  return i18nKey ? translator(i18nKey, value) : defaultValue || undefined;
};

export const getI18nDescription: (
  defaultValue: string | null,
  translator: Translator,
  element: UISchemaElement,
  path: string,
  resolvedSchema?: JsonSchema,
) => string | undefined = (...arg) => i18nHelper("description", ...arg);

export const getI18nLabel: (
  defaultValue: string | null,
  translator: Translator,
  element: UISchemaElement,
  path: string,
  resolvedSchema?: JsonSchema,
) => string | undefined = (...arg) => i18nHelper("label", ...arg);
