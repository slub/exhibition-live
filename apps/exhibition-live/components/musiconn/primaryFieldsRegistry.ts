import { JsonFormsRendererRegistryEntry } from "@jsonforms/core";
import { IRIToStringFn } from "@slub/edb-core-types";
import {
  primaryTextFieldControlTester,
  PrimaryTextFieldRenderer,
} from "../renderer";
import { primaryFields } from "./primaryFields";

export const primaryFieldsRegistry: (
  typeIRI: string,
  typeIRItoTypeName: IRIToStringFn,
) => JsonFormsRendererRegistryEntry[] = (typeIRI, typeIRIToTypeName) =>
  primaryFields[typeIRIToTypeName(typeIRI)]?.label
    ? [
        {
          tester: primaryTextFieldControlTester(typeIRIToTypeName(typeIRI)),
          renderer: PrimaryTextFieldRenderer,
        },
      ]
    : [];
