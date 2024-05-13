import { AgeRenderer, ageRendererTester } from "./AgeRenderer";
import { JsonFormsRendererRegistryEntry } from "@jsonforms/core";

export const additionalRenderers: JsonFormsRendererRegistryEntry[] = [
  {
    tester: ageRendererTester,
    renderer: AgeRenderer,
  },
];
