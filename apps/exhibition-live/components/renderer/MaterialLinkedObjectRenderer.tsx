import isEmpty from 'lodash/isEmpty';
import {
  findUISchema,
  Generate,
  isObjectControl, Layout,
  RankedTester,
  rankWith, Scopable,
  StatePropsOfControlWithDetail, UISchemaElement,
} from '@jsonforms/core';
import {JsonFormsDispatch, withJsonFormsDetailProps} from '@jsonforms/react';
import {Hidden, Typography} from '@mui/material';
import React, {useMemo} from 'react';

export const MaterialLinkedObjectRenderer = ({
                                               renderers,
                                               cells,
                                               uischemas,
                                               schema,
                                               label,
                                               path,
                                               visible,
                                               enabled,
                                               uischema,
                                               rootSchema,
                                               config
                                             }: StatePropsOfControlWithDetail) => {
  const detailUiSchema = useMemo(
      () => {
        const uiSchemaElement: Layout | undefined= uischemas && findUISchema(
            uischemas,
            schema,
            uischema.scope,
            path,
            () =>
                isEmpty(path)
                    ? Generate.uiSchema(schema, 'VerticalLayout')
                    : {...Generate.uiSchema(schema, 'Group'), label},
            uischema,
            rootSchema
        ) as (Layout | undefined);
        const elements = uiSchemaElement?.elements as (Scopable[] | undefined)
        return ((elements && elements[0]?.scope === '#/properties/@id') ? {
          ...uiSchemaElement,
          elements: [
            {
              ...elements[0],
              label
            },
            ...elements.slice(1)
          ]
        } : uiSchemaElement) as UISchemaElement;
      },
      [uischemas, schema, uischema.scope, path, label, uischema, rootSchema]
  );

  return (
      <Hidden xsUp={!visible}>
        <JsonFormsDispatch
            visible={visible}
            enabled={enabled}
            schema={schema}
            uischema={detailUiSchema}
            path={path}
            renderers={renderers}
            cells={cells}
        />
      </Hidden>
  );
};

export const materialLinkedObjectControlTester: RankedTester = rankWith(
    4,
    isObjectControl
);

export default withJsonFormsDetailProps(MaterialLinkedObjectRenderer);
