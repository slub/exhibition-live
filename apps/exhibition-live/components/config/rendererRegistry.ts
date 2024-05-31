import {
  MaterialBooleanControl,
  materialRenderers,
} from "@jsonforms/material-renderers";
import {
  and,
  isObjectArray,
  isObjectArrayControl,
  JsonFormsRendererRegistryEntry,
  rankWith,
  schemaMatches,
  scopeEndsWith,
  UISchemaElement,
} from "@jsonforms/core";
import { JSONSchema7 } from "json-schema";
import { isEmpty } from "lodash";
import { withJsonFormsControlProps } from "@jsonforms/react";
import { MarkdownTextFieldRendererComponent } from "@slub/edb-markdown-renderer";
import {
  materialCustomAnyOfControlTester,
  MaterialCustomAnyOfRenderer,
} from "@slub/edb-layout-renderer";
import {
  adbSpecialDateControlTester,
  AdbSpecialDateRenderer,
  AutoIdentifierRenderer,
  ImageRenderer,
  materialBooleanControlTester,
  TypeOfRenderer,
} from "@slub/edb-basic-renderer";
import {
  InlineCondensedSemanticFormsRenderer,
  InlineDropdownRenderer,
  materialArrayChipsLayoutTester,
  MaterialArrayOfLinkedItemChipsRenderer,
  MaterialArrayOfLinkedItemRenderer,
  materialLinkedObjectControlTester,
  MaterialLinkedObjectRenderer,
} from "@slub/edb-linked-data-renderer";

export const rendererRegistry: JsonFormsRendererRegistryEntry[] = [
  ...materialRenderers,
  {
    tester: materialCustomAnyOfControlTester,
    renderer: MaterialCustomAnyOfRenderer,
  },
  {
    tester: rankWith(10, scopeEndsWith("image")),
    renderer: ImageRenderer,
  },
  {
    tester: rankWith(10, scopeEndsWith("@id")),
    renderer: AutoIdentifierRenderer,
  },
  {
    tester: rankWith(10, scopeEndsWith("@type")),
    renderer: TypeOfRenderer,
  },
  {
    tester: rankWith(
      5,
      and(
        isObjectArray,
        schemaMatches((schema) => {
          if (
            !(
              schema.type === "array" &&
              typeof schema.items === "object" &&
              (schema.items as JSONSchema7).properties
            )
          ) {
            return Boolean((schema.items as JSONSchema7).$ref);
          }
          const props = (schema.items as JSONSchema7).properties;
          return Boolean(props["@id"] && props["@type"]);
        }),
      ),
    ),
    renderer: MaterialArrayOfLinkedItemRenderer,
  },
  {
    tester: materialArrayChipsLayoutTester,
    renderer: MaterialArrayOfLinkedItemChipsRenderer,
  },
  {
    tester: rankWith(14, (uischema: UISchemaElement, schema, ctx): boolean => {
      if (isEmpty(uischema) || isObjectArrayControl(uischema, schema, ctx)) {
        return false;
      }
      const options = uischema.options;
      return !isEmpty(options) && options["inline"];
    }),
    renderer: InlineCondensedSemanticFormsRenderer,
  },
  {
    tester: rankWith(15, (uischema: UISchemaElement, schema, ctx): boolean => {
      if (isEmpty(uischema) || isObjectArrayControl(uischema, schema, ctx)) {
        return false;
      }
      const options = uischema.options;
      return !isEmpty(options) && options["dropdown"] === true;
    }),
    renderer: InlineDropdownRenderer,
  },
  {
    tester: materialLinkedObjectControlTester,
    renderer: MaterialLinkedObjectRenderer,
  },
  {
    tester: adbSpecialDateControlTester,
    renderer: AdbSpecialDateRenderer,
  },
  {
    tester: materialBooleanControlTester,
    renderer: MaterialBooleanControl,
  },
  {
    tester: rankWith(10, scopeEndsWith("description")),
    renderer: withJsonFormsControlProps(MarkdownTextFieldRendererComponent),
  },
];
