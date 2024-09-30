import ds from "@rdfjs/data-model";
import namespace from "@rdfjs/namespace";
import { Dataset } from "@rdfjs/types";
import { rdf } from "@tpluscode/rdf-ns-builders";
import clownface from "clownface";
import { JSONSchema7, JSONSchema7Definition } from "json-schema";
import {
  isJSONSchema,
  isJSONSchemaDefinition,
  resolveSchema,
} from "@slub/json-schema-utils";
import { filterUndefOrNull } from "@slub/edb-core-utils";
import { JsonSchema, WalkerOptions } from "./types";
import DatasetCore from "@rdfjs/dataset/DatasetCore";

const isNil = (val: any) => val === undefined || val === null;

type CircularCounter = {
  [ref: string]: number;
};

const propertyWalker = (
  baseIRI: string,
  node: clownface.GraphPointer,
  subSchema: JSONSchema7,
  rootSchema: JSONSchema7,
  level: number,
  circularSet: CircularCounter,
  options: Partial<WalkerOptions>,
  skipProps: boolean,
) => {
  const base = namespace(baseIRI);
  const MAX_RECURSION = options?.maxRecursionEachRef || 5;
  const skipNextProps =
    typeof options?.skipAtLevel === "number"
      ? level >= options?.skipAtLevel
      : false;
  if (
    typeof options?.maxRecursion === "number" &&
    level > options?.maxRecursion
  ) {
    return;
  }

  const isDraft = Boolean(node.out(base["__draft"])?.value);
  let additionalProps = {};
  if (subSchema.type === "object") {
    if (node.term?.termType === "NamedNode") {
      additionalProps = {
        "@id": node.term.value,
      };
      if (!isDraft && options.doNotRecurseNamedNodes && level > 0) {
        return additionalProps;
      }
    }
    if (!isDraft && skipProps) {
      return additionalProps;
    }
    const typeNode = node.out(rdf.type);
    if (typeNode.value) {
      additionalProps = {
        ...additionalProps,
        "@type": typeNode.value,
      };
    }
  }
  const entries = Object.entries(subSchema.properties || {})
    .map(([property, schema]) => {
      let val: any;
      const newNode = node.out(base[property]);
      if (isJSONSchema(schema)) {
        if (schema.$ref) {
          const ref = schema.$ref;
          const subSchema = resolveSchema(
            schema as JsonSchema,
            "",
            rootSchema as JsonSchema,
          );
          if (
            subSchema &&
            isJSONSchemaDefinition(subSchema as JSONSchema7Definition) &&
            isJSONSchema(subSchema as JSONSchema7)
          ) {
            if (!circularSet[ref] || circularSet[ref] < MAX_RECURSION) {
              val = propertyWalker(
                baseIRI,
                newNode as clownface.GraphPointer,
                subSchema as JSONSchema7,
                rootSchema,
                level + 1,
                { ...circularSet, [ref]: (circularSet[ref] || 0) + 1 },
                options,
                skipNextProps,
              );
            }
          }
        } else if (schema.properties) {
          val = propertyWalker(
            baseIRI,
            newNode as clownface.GraphPointer,
            schema,
            rootSchema,
            level + 1,
            circularSet,
            options,
            skipNextProps,
          );
        } else if (schema.items) {
          val = filterUndefOrNull(
            newNode.map((quad) => {
              if (
                isJSONSchemaDefinition(schema.items) &&
                isJSONSchema(schema.items)
              ) {
                if (schema.items.$ref) {
                  const ref = schema.items.$ref;
                  const subSchema = resolveSchema(
                    schema.items as JsonSchema,
                    "",
                    rootSchema as JsonSchema,
                  );
                  if (
                    subSchema &&
                    isJSONSchemaDefinition(
                      subSchema as JSONSchema7Definition,
                    ) &&
                    isJSONSchema(subSchema as JSONSchema7)
                  ) {
                    if ((circularSet[ref] || 0) < MAX_RECURSION) {
                      return propertyWalker(
                        baseIRI,
                        quad,
                        subSchema as JSONSchema7,
                        rootSchema,
                        level + 1,
                        { ...circularSet, [ref]: (circularSet[ref] || 0) + 1 },
                        options,
                        skipNextProps,
                      );
                    }
                    return;
                  }
                } else if (schema.items.properties) {
                  return propertyWalker(
                    baseIRI,
                    quad,
                    schema.items,
                    rootSchema,
                    level + 1,
                    circularSet,
                    options,
                    skipNextProps,
                  );
                }
                if (schema.items.type) {
                  if (!Array.isArray(schema.items.type)) {
                    switch (schema.items.type) {
                      case "object":
                        return {};
                      case "array":
                        return [];
                      case "integer":
                        return parseInt(quad.value);
                      case "number":
                        return parseFloat(quad.value);
                      case "boolean":
                        return quad.value === "true";
                      case "string":
                        return quad.value;
                      default:
                        return quad.value;
                    }
                  }
                }
              }
            }),
          );
        } else if (schema.type === "array") {
          val = newNode.values;
        }
        if (!val) {
          if (!Array.isArray(schema.type) && newNode.values) {
            switch (schema.type) {
              case "number":
                val = parseFloat(newNode.values[0]);
                if (isNaN(val)) val = undefined;
                break;
              case "integer":
                val = parseInt(newNode.values[0]);
                if (isNaN(val)) val = undefined;
                break;
              case "boolean":
                val = isNil(newNode.values[0])
                  ? undefined
                  : newNode.values[0] === "true";
                break;
              case "string":
              default:
                val = newNode.values[0];
            }
          }
        }
      }
      return [property, val];
    })
    .filter(
      ([_, val]) =>
        !(val === undefined) &&
        !(val === null) &&
        !(
          options?.omitEmptyArrays &&
          Array.isArray(val) &&
          (val as any[]).length === 0
        ) &&
        !(
          options?.omitEmptyObjects &&
          typeof val === "object" &&
          Object.keys(val).length === 0
        ),
    );

  return {
    ...additionalProps,
    ...Object.fromEntries(entries),
  };
};
export const traverseGraphExtractBySchema = (
  baseIRI: string,
  iri: string,
  dataset: Dataset | DatasetCore,
  rootSchema: JSONSchema7,
  options: Partial<WalkerOptions>,
) => {
  const tbbt = clownface({ dataset });
  const startNode: clownface.GraphPointer = tbbt.node(ds.namedNode(iri));
  return propertyWalker(
    baseIRI,
    startNode,
    rootSchema,
    rootSchema,
    0,
    {},
    options || {},
    false,
  );
};
