import React, {useState} from 'react';
import merge from 'lodash/merge';
import { Button, Hidden, Step, StepButton, Stepper } from '@mui/material';
import {
  and,
  Categorization,
  categorizationHasCategory,
  Category,
  isVisible,
  optionIs,
  RankedTester,
  rankWith,
  StatePropsOfLayout,
  uiTypeIs
} from '@jsonforms/core';
import { withJsonFormsLayoutProps } from '@jsonforms/react';
import {
  AjvProps,
  MaterialLayoutRenderer,
  MaterialLayoutRendererProps,
  withAjvProps
} from '@jsonforms/material-renderers';

export const materialCategorizationStepperTester: RankedTester = rankWith(
  4,
  and(
    uiTypeIs('Categorization'),
    categorizationHasCategory,
    optionIs('variant', 'stepper')
  )
);

export interface CategorizationStepperState {
  activeCategory: number;
}

export interface MaterialCategorizationStepperLayoutRendererProps
  extends StatePropsOfLayout, AjvProps {
    data: any;
}

export const MaterialCategorizationStepperLayout = (props: MaterialCategorizationStepperLayoutRendererProps)=> {
  const [activeCategory, setActiveCategory] = useState<number>(0);

  const handleStep = (step: number) => {
    setActiveCategory( step);
  };

  const {
    data,
    path,
    renderers,
    schema,
    uischema,
    visible,
    cells,
    config,
    ajv
  } = props;
  const categorization = uischema as Categorization;
  const appliedUiSchemaOptions = merge({}, config, uischema.options);
  const buttonWrapperStyle = {
    textAlign: 'right' as 'right',
    width: '100%',
    margin: '1em auto'
  };
  const buttonNextStyle = {
    float: 'right' as 'right'
  };
  const buttonStyle = {
    marginRight: '1em'
  };
  const categories = categorization.elements.filter((category: Category) =>
    isVisible(category, data, undefined, ajv)
  );
  const childProps: MaterialLayoutRendererProps = {
    elements: categories[activeCategory].elements,
    schema,
    path,
    direction: 'column',
    visible,
    renderers,
    cells
  };
  return (
    <Hidden xsUp={!visible}>
      <Stepper activeStep={activeCategory} nonLinear>
        {categories.map((e: Category, idx: number) => (
          <Step key={e.label}>
            <StepButton onClick={() => handleStep(idx)}>
              {e.label}
            </StepButton>
          </Step>
        ))}
      </Stepper>
      <div>
        <MaterialLayoutRenderer {...childProps} />
      </div>
      { !!appliedUiSchemaOptions.showNavButtons ? (<div style={buttonWrapperStyle}>
        <Button
          style={buttonNextStyle}
          variant="contained"
          color="primary"
          disabled={activeCategory >= categories.length - 1}
          onClick={() => handleStep(activeCategory + 1)}
        >
          Next Step
        </Button>
        <Button
          style={buttonStyle}
          color="secondary"
          variant="contained"
          disabled={activeCategory <= 0}
          onClick={() => handleStep(activeCategory - 1)}
        >
          Previous
        </Button>
      </div>) : (<></>)}
    </Hidden>
  );
};

export const materialCategorizationStepperLayoutWithPortal = {
  tester: materialCategorizationStepperTester,
  renderer: withJsonFormsLayoutProps(withAjvProps(
      MaterialCategorizationStepperLayout
  ))
}
