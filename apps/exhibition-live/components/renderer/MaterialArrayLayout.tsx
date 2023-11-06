/*
  The MIT License

  Copyright (c) 2017-2019 EclipseSource Munich
  https://github.com/eclipsesource/jsonforms

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
*/
import {
  ArrayLayoutProps,
  composePaths,
  computeLabel,
  createDefaultValue,
  JsonSchema,
  JsonSchema7,
  Resolve,
} from "@jsonforms/core";
import map from "lodash/map";
import merge from "lodash/merge";
import range from "lodash/range";
import React, { useCallback, useMemo, useState } from "react";

import { ArrayLayoutToolbar, getDefaultKey } from "./ArrayToolbar";
import ExpandPanelRenderer from "./ExpandPanelRenderer";
import { useJsonForms } from "@jsonforms/react";
import { memo } from "./config";
import { uniqBy, orderBy, isArray } from "lodash";
import { SimpleExpandPanelRenderer } from "./SimpleExpandPanelRenderer";
import { SemanticFormsModal } from "./SemanticFormsModal";
import { BASE_IRI } from "../config";
import { bringDefinitionToTop } from "../utils/core";
import { JSONSchema7 } from "json-schema";
import { slent } from "../form/formConfigs";
import { v4 as uuidv4 } from "uuid";

type OwnProps = {
  removeItems(path: string, toDelete: number[]): () => void;
};
const MaterialArrayLayoutComponent = (props: ArrayLayoutProps & {}) => {
  const [expanded, setExpanded] = useState<string | boolean>(false);
  const innerCreateDefaultValue = useCallback(
    () => createDefaultValue(props.schema),
    [props.schema],
  );
  const handleChange = useCallback(
    (panel: string) => (_event: any, expandedPanel: boolean) => {
      setExpanded(expandedPanel ? panel : false);
    },
    [],
  );
  const isExpanded = (pathOrID: string) => expanded === pathOrID;

  const {
    data,
    path,
    schema,
    uischema,
    errors,
    addItem,
    renderers,
    cells,
    label,
    required,
    rootSchema,
    config,
    uischemas,
    removeItems,
  } = props;
  const appliedUiSchemaOptions = merge({}, config, props.uischema.options);
  const { readonly, core } = useJsonForms();
  const realData = Resolve.data(core.data, path);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [newIRI, setNewIRI] = useState(slent(uuidv4()).value);

  const handleCreateNew = useCallback(() => {
    setNewIRI(slent(uuidv4()).value);
    setModalIsOpen(true);
  }, [setModalIsOpen, setNewIRI]);
  const handleAddNew = useCallback(() => {
    setModalIsOpen(false);
    addItem(path, {
      "@id": newIRI,
    })();
  }, [setModalIsOpen, addItem, newIRI]);

  const typeIRI = schema.properties?.["@type"]?.const;
  const typeName = useMemo(
    () => typeIRI && typeIRI.substring(BASE_IRI.length, typeIRI.length),
    [typeIRI],
  );
  const subSchema = useMemo(
    () =>
      bringDefinitionToTop(rootSchema as JSONSchema7, typeName) as JsonSchema,
    [rootSchema, typeName],
  );

  return (
    <div>
      <ArrayLayoutToolbar
        label={computeLabel(
          label,
          Boolean(required),
          appliedUiSchemaOptions.hideRequiredAsterisk,
        )}
        errors={errors}
        path={path}
        schema={schema as JsonSchema7 | undefined}
        addItem={addItem}
        onCreate={handleCreateNew}
        createDefault={innerCreateDefaultValue}
        readonly={readonly}
      />
      {modalIsOpen && (
        <SemanticFormsModal
          schema={subSchema}
          data={newIRI}
          typeIRI={typeIRI}
          label={label}
          open={modalIsOpen}
          askClose={handleAddNew}
          askCancel={() => setModalIsOpen(false)}
          onChange={(iri) => {
            setNewIRI(iri);
          }}
        />
      )}
      <div>
        {data > 0
          ? orderBy(
              uniqBy(
                realData?.map((childData, index) => ({
                  id: childData["@id"],
                  childData,
                  index,
                })),
                "id",
              ),
              "id",
            ).map(({ id: expandID, childData, index }: any) => {
              const childPath = composePaths(path, `${index}`);
              return (
                <SimpleExpandPanelRenderer
                  onRemove={removeItems(path, [index])}
                  schema={schema}
                  onChange={() => {}}
                  rootSchema={rootSchema}
                  entityIRI={expandID}
                  data={childData}
                  key={expandID}
                  index={index}
                />
              );
            })
          : /*map(range(data), (index) => {
            const childPath = composePaths(path, `${index}`);
              const childData = Resolve.data(core.data, childPath);
              const key = childData['@id'] || index;
              const expandID = childData['@id'] || childPath
            return {
              childPath,
              key,
              expandID,
            }
          })
            .map(({ childPath, key, expandID }, index) => {
              return (
                <ExpandPanelRenderer
                  index={index}
                  expanded={isExpanded(expandID)}
                  schema={schema}
                  path={path}
                  handleExpansion={() => handleChange(expandID)}
                  uischema={uischema}
                  renderers={renderers}
                  cells={cells}
                  key={key}
                  rootSchema={rootSchema}
                  enableMoveUp={index != 0}
                  enableMoveDown={index < data - 1}
                  config={config}
                  childLabelProp={appliedUiSchemaOptions.elementLabelProp}
                  childLabelTemplate={
                    appliedUiSchemaOptions.elementLabelTemplate
                  }
                  uischemas={uischemas}
                  readonly={readonly}
                />
              );
            })*/
            null}
      </div>
    </div>
  );
};

export const MaterialArrayLayout = memo(MaterialArrayLayoutComponent);
