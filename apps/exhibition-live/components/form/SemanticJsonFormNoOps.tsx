import "react-json-view-lite/dist/index.css";

import {
  and,
  isObjectArray,
  isObjectArrayControl,
  JsonFormsCore,
  JsonSchema,
  rankWith,
  schemaMatches,
  scopeEndsWith,
  UISchemaElement,
} from "@jsonforms/core";
import {
  materialCells,
  materialRenderers,
} from "@jsonforms/material-renderers";
import { JsonForms, JsonFormsInitStateProps } from "@jsonforms/react";
import { Card, CardContent, Grid } from "@mui/material";
import { JSONSchema7 } from "json-schema";
import { isEmpty } from "lodash";
import React, { FunctionComponent, useCallback, useMemo } from "react";

import AdbSpecialDateRenderer, {
  adbSpecialDateControlTester,
} from "../renderer/AdbSpecialDateRenderer";
import AutoIdentifierRenderer from "../renderer/AutoIdentifierRenderer";
import ImageRenderer from "../renderer/ImageRenderer";
import InlineCondensedSemanticFormsRenderer from "../renderer/InlineCondensedSemanticFormsRenderer";
import MaterialArrayOfLinkedItemRenderer from "../renderer/MaterialArrayOfLinkedItemRenderer";
import MaterialCustomAnyOfRenderer, {
  materialCustomAnyOfControlTester,
} from "../renderer/MaterialCustomAnyOfRenderer";
import MaterialLinkedObjectRenderer, {
  materialLinkedObjectControlTester,
} from "../renderer/MaterialLinkedObjectRenderer";
import TypeOfRenderer from "../renderer/TypeOfRenderer";
import SimilarityFinder from "./SimilarityFinder";
import { FormDebuggingTools } from "./FormDebuggingTools";
import { SearchbarWithFloatingButton } from "../layout/main-layout/Searchbar";
import MaterialBooleanControl, {
  materialBooleanControlTester,
} from "../renderer/MaterialBooleanControl";
import { primaryFields, typeIRItoTypeName } from "../config";
import NiceModal from "@ebay/nice-modal-react";
import GenericModal from "./GenericModal";
import {
  primaryTextFieldControlTester,
  PrimaryTextFieldRenderer,
} from "../renderer/PrimaryFieldTextRenderer";
import { useGlobalSearch } from "../state";

export type CRUDOpsType = {
  load: () => Promise<void>;
  save: () => Promise<void>;
  remove: () => Promise<void>;
};

export type ChangeCause = "user" | "mapping" | "reload";

export interface SemanticJsonFormsNoOpsProps {
  typeIRI: string;
  data: any;
  onChange?: (data: any, reason: ChangeCause) => void;
  onError?: (error: Pick<JsonFormsCore, "errors">) => void;
  schema: JSONSchema7;
  jsonFormsProps?: Partial<JsonFormsInitStateProps>;
  onEntityChange?: (entityIRI: string | undefined) => void;
  onEntityDataChange?: (entityData: any) => void;
  toolbar?: React.ReactNode;
  forceEditMode?: boolean;
  defaultEditMode?: boolean;
  searchText?: string;
  disableSimilarityFinder?: boolean;
  enableSidebar?: boolean;
  wrapWithinCard?: boolean;
  formsPath?: string;
}

const renderers = [
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
    tester: adbSpecialDateControlTester,
    renderer: AdbSpecialDateRenderer,
  },
  {
    tester: materialLinkedObjectControlTester,
    renderer: MaterialLinkedObjectRenderer,
  },
  {
    tester: materialBooleanControlTester,
    renderer: MaterialBooleanControl,
  },
];

export const SemanticJsonFormNoOps: FunctionComponent<
  SemanticJsonFormsNoOpsProps
> = ({
  data,
  onChange,
  onError,
  typeIRI,
  schema,
  jsonFormsProps = {},
  onEntityDataChange,
  toolbar,
  searchText,
  disableSimilarityFinder,
  enableSidebar,
  wrapWithinCard,
  formsPath,
}) => {
  const searchOnDataPath = useMemo(() => {
    const typeName = typeIRItoTypeName(typeIRI);
    return primaryFields[typeName]?.label;
  }, [typeIRI]);
  const primaryFieldRenderer = useMemo(
    () =>
      primaryFields[typeIRItoTypeName(typeIRI)]?.label
        ? [
            {
              tester: primaryTextFieldControlTester(typeIRItoTypeName(typeIRI)),
              renderer: PrimaryTextFieldRenderer,
            },
          ]
        : [],
    [typeIRI],
  );

  const handleFormChange = useCallback(
    (state: Pick<JsonFormsCore, "data" | "errors">) => {
      onChange && onChange(state.data, "user");
      if (state.errors && state.errors.length > 0 && onError) onError(state);
    },
    [onChange, onError],
  );

  const handleMappedData = useCallback(
    (newData: any) => {
      if (!newData) return;
      //avoid overriding of id and type by mapped data
      NiceModal.show(GenericModal, {
        type:
          newData["@type"] !== typeIRI
            ? "confirm save mapping"
            : "confirm mapping",
      }).then(() => {
        onChange(
          (data: any) => ({
            ...newData,
            "@id": data["@id"],
            "@type": data["@type"],
          }),
          "mapping",
        );
      });
    },
    [onChange, typeIRI],
  );

  const handleEntityIRIChange = useCallback(
    (iri) =>
      onEntityDataChange &&
      onEntityDataChange({ "@id": iri, "@type": typeIRI }),
    [onEntityDataChange, typeIRI],
  );

  const WithCard = useMemo(
    () =>
      ({ children }: { children: React.ReactNode }) =>
        wrapWithinCard ? (
          <Card>
            <CardContent>{children}</CardContent>
          </Card>
        ) : (
          children
        ),
    [wrapWithinCard],
  );
  const { renderers: jfpRenderers, config, ...jfpProps } = jsonFormsProps;
  const finalJsonFormsProps = {
    ...jfpProps,
    config: {
      ...config,
      formsPath,
      typeIRI,
    },
  };
  const allRenderer = useMemo(
    () => [...renderers, ...(jfpRenderers || []), ...primaryFieldRenderer],
    [jfpRenderers, primaryFieldRenderer],
  );
  const { path: globalPath } = useGlobalSearch();

  return (
    <Grid container spacing={0}>
      <Grid item flex={1}>
        <Grid container spacing={0}>
          <Grid
            item
            xs={
              disableSimilarityFinder || enableSidebar || !searchText ? 12 : 6
            }
          >
            <WithCard>
              {toolbar ? toolbar : null}
              <JsonForms
                data={data}
                renderers={allRenderer}
                cells={materialCells}
                onChange={handleFormChange}
                schema={schema as JsonSchema}
                {...finalJsonFormsProps}
              />
            </WithCard>
          </Grid>
          {!disableSimilarityFinder && !enableSidebar && searchText && (
            <Grid xs={6} item>
              <SimilarityFinder
                search={searchText}
                data={data}
                classIRI={typeIRI}
                jsonSchema={schema}
                onEntityIRIChange={handleEntityIRIChange}
                searchOnDataPath={searchOnDataPath}
                onMappedDataAccepted={handleMappedData}
              />
            </Grid>
          )}
        </Grid>
      </Grid>
      {formsPath === globalPath && (
        <Grid item>
          {" "}
          <SearchbarWithFloatingButton>
            <SimilarityFinder
              search={searchText}
              data={data}
              classIRI={typeIRI}
              jsonSchema={schema}
              onEntityIRIChange={handleEntityIRIChange}
              searchOnDataPath={searchOnDataPath}
              onMappedDataAccepted={handleMappedData}
            />
          </SearchbarWithFloatingButton>{" "}
        </Grid>
      )}
    </Grid>
  );
};
