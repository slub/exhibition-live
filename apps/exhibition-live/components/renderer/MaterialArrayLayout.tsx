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
import { defaultJsonldContext, slent } from "../form/formConfigs";
import { v4 as uuidv4 } from "uuid";
import { Grid, IconButton, List } from "@mui/material";
import { SemanticFormsInline } from "./SemanticFormsInline";
import AddIcon from "@mui/icons-material/Add";
import { useCRUD } from "../state/useCRUD";

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
    errors,
    addItem,
    renderers,
    cells,
    label,
    required,
    rootSchema,
    config,
    removeItems,
  } = props;
  const appliedUiSchemaOptions = merge({}, config, props.uischema.options);
  const { readonly, core } = useJsonForms();
  const realData = Resolve.data(core.data, path);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [formData, setFormData] = useState<any>({
    "@id": slent(uuidv4()).value,
  });

  const handleCreateNew = useCallback(() => {
    setFormData({ "@id": slent(uuidv4()).value });
    setModalIsOpen(true);
  }, [setModalIsOpen, setFormData]);

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
  const { save } = useCRUD(formData, subSchema as JSONSchema7);

  const handleSaveAndAdd = useCallback(() => {
    const id = slent(uuidv4()).value;
    const finalData = {
      ...formData,
      "@type": typeIRI,
      "@id": id,
      "@context": defaultJsonldContext,
    };
    //if(typeof saveMethod === 'function')  saveMethod();
    save(finalData).then(() => {
      addItem(path, finalData)();
      setFormData({});
    });
  }, [save, addItem, setFormData]);

  const handleAddNew = useCallback(() => {
    setModalIsOpen(false);
    //if(typeof saveMethod === 'function')  saveMethod();
    addItem(path, formData)();
    setFormData({});
  }, [setModalIsOpen, addItem, formData, setFormData, typeIRI]);

  const isReifiedStatement = Boolean(appliedUiSchemaOptions.isReifiedStatement);

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
        isReifiedStatement={isReifiedStatement}
      />
      {modalIsOpen && (
        <SemanticFormsModal
          schema={subSchema}
          formData={formData}
          typeIRI={typeIRI}
          label={label}
          open={modalIsOpen}
          askClose={handleAddNew}
          askCancel={() => setModalIsOpen(false)}
          onChange={(entityIRI) =>
            entityIRI && setFormData({ "@id": entityIRI })
          }
          onFormDataChange={(data) => setFormData(data)}
        />
      )}
      {isReifiedStatement && (
        <Grid display={"flex"} direction={"row"} alignItems={"center"}>
          <Grid item flex={"1"}>
            <SemanticFormsInline
              schema={subSchema}
              typeIRI={typeIRI}
              formData={formData}
              onFormDataChange={(data) => setFormData(data)}
            />
          </Grid>
          <Grid item>
            <IconButton onClick={handleSaveAndAdd}>
              <AddIcon style={{ fontSize: 40 }} />
            </IconButton>
          </Grid>
        </Grid>
      )}
      <List dense>
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
            ).map(({ id: expandID, childData, index }: any, count) => {
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
                  count={count}
                  path={childPath}
                  childLabelTemplate={
                    appliedUiSchemaOptions.elementLabelTemplate
                  }
                />
              );
            })
          : null}
      </List>
    </div>
  );
};

export const MaterialArrayLayout = memo(MaterialArrayLayoutComponent);
