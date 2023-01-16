import React, {FunctionComponent, useCallback} from 'react';
import {JsonForms} from "@jsonforms/react";
import {materialCells, materialRenderers} from "@jsonforms/material-renderers";
import uischema from "../../schema/exhibition-form-ui-schema.json";
import schema from "../../schema/exhibition-info.schema.json";
import {JsonFormsCore} from "@jsonforms/core";

const exhibitionSchema = { ...schema, ...schema.$defs.Exhibition}

interface OwnProps {
  data: any,
  setData: (data: any) => void
}

type Props = OwnProps;

const EditExhibitionJSONForm: FunctionComponent<Props> = ({data, setData}) => {
  const handleFormChange = useCallback(
      (state: Pick<JsonFormsCore, 'data' | 'errors'>) => {
        setData(state.data)
      }, [setData])

  return (
      <JsonForms
          data={data}
          renderers={materialRenderers}
          cells={materialCells}
          onChange={handleFormChange}
          schema={exhibitionSchema}
          uischema={uischema}
      />
  );
};

export default EditExhibitionJSONForm;
