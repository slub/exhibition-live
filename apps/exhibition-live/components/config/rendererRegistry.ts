import { materialRenderers } from "@jsonforms/material-renderers";
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
import ImageRenderer from "../renderer/ImageRenderer";
import AutoIdentifierRenderer from "../renderer/AutoIdentifierRenderer";
import TypeOfRenderer from "../renderer/TypeOfRenderer";
import { JSONSchema7 } from "json-schema";
import MaterialArrayOfLinkedItemRenderer from "../renderer/MaterialArrayOfLinkedItemRenderer";
import { materialArrayLayoutChipsTester } from "../renderer";
import MaterialArrayOfLinkedItemChipsRenderer from "../renderer/MaterialArrayOfLinkedItemChipsRenderer";
import { isEmpty } from "lodash";
import InlineCondensedSemanticFormsRenderer from "../renderer/InlineCondensedSemanticFormsRenderer";
import InlineDropdownRenderer from "../renderer/InlineDropdownRenderer";
import MaterialLinkedObjectRenderer, {
  materialLinkedObjectControlTester,
} from "../renderer/MaterialLinkedObjectRenderer";
import AdbSpecialDateRenderer, {
  adbSpecialDateControlTester,
} from "../renderer/AdbSpecialDateRenderer";
import MaterialBooleanControl, {
  materialBooleanControlTester,
} from "../renderer/MaterialBooleanControl";
import { withJsonFormsControlProps } from "@jsonforms/react";
import { MarkdownTextFieldRendererComponent } from "@slub/edb-markdown-renderer";
import {
  materialCustomAnyOfControlTester,
  MaterialCustomAnyOfRenderer,
} from "@slub/edb-layout-renderer";

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
    tester: materialArrayLayoutChipsTester,
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
