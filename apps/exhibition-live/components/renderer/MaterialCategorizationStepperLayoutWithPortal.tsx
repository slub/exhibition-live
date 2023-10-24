import React, { ComponentType, useState } from "react";
import merge from "lodash/merge";
import { Button, Hidden, Step, StepButton, Stepper } from "@mui/material";
import {
  and,
  Categorization,
  categorizationHasCategory,
  Category,
  getAjv,
  isVisible,
  optionIs,
  RankedTester,
  rankWith,
  StatePropsOfLayout,
  uiTypeIs,
} from "@jsonforms/core";
import { useJsonForms, withJsonFormsLayoutProps } from "@jsonforms/react";
import {
  AjvProps,
  MaterialLayoutRenderer,
  MaterialLayoutRendererProps,
} from "@jsonforms/material-renderers";
import { createPortal } from "react-dom";

export const materialCategorizationStepperTester: RankedTester = rankWith(
  4,
  and(
    uiTypeIs("Categorization"),
    categorizationHasCategory,
    optionIs("variant", "stepper"),
  ),
);

export interface CategorizationStepperState {
  activeCategory: number;
}

export interface MaterialCategorizationStepperLayoutRendererProps
  extends StatePropsOfLayout,
    AjvProps {
  data: any;
  container?: HTMLElement;
  actionContainer?: HTMLElement;
}

const optionallyCreatePortal = (
  children: React.ReactNode,
  container?: HTMLElement,
) => (container ? createPortal(children, container) : children);

export const MaterialCategorizationStepperLayout = (
  props: MaterialCategorizationStepperLayoutRendererProps,
) => {
  const [activeCategory, setActiveCategory] = useState<number>(0);

  const handleStep = (step: number) => {
    setActiveCategory(step);
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
    ajv,
    container,
    actionContainer,
  } = props;
  const categorization = uischema as Categorization;
  const appliedUiSchemaOptions = merge({}, config, uischema.options);
  const buttonWrapperStyle = {
    textAlign: "right" as "right",
    width: "100%",
    margin: "1em auto",
  };
  const buttonNextStyle = {};
  const buttonStyle = {
    marginRight: "1em",
  };
  const categories = categorization.elements.filter((category: Category) =>
    isVisible(category, data, undefined, ajv),
  );
  const childProps: MaterialLayoutRendererProps = {
    elements: categories[activeCategory].elements,
    schema,
    path,
    direction: "column",
    visible,
    renderers,
    cells,
  };
  return !container ? null : (
    <Hidden xsUp={!visible}>
      <>
        {createPortal(
          <Stepper
            activeStep={activeCategory}
            nonLinear
            orientation={"vertical"}
          >
            {categories.map((e: Category, idx: number) => (
              <Step key={e.label}>
                <StepButton onClick={() => handleStep(idx)}>
                  {e.label}
                </StepButton>
              </Step>
            ))}
          </Stepper>,
          container,
        )}
        <div>
          <MaterialLayoutRenderer {...childProps} />
        </div>
        {!!appliedUiSchemaOptions.showNavButtons
          ? optionallyCreatePortal(
              <>
                <Button
                  style={buttonStyle}
                  color="secondary"
                  variant="contained"
                  disabled={activeCategory <= 0}
                  onClick={() => handleStep(activeCategory - 1)}
                >
                  zurück
                </Button>
                <Button
                  style={buttonNextStyle}
                  variant="contained"
                  color="primary"
                  disabled={activeCategory >= categories.length - 1}
                  onClick={() => handleStep(activeCategory + 1)}
                >
                  weiter
                </Button>
              </>,
              actionContainer,
            )
          : null}
      </>
    </Hidden>
  );
};
const withAjvProps =
  <P extends {}>(
    Component: ComponentType<AjvProps & P>,
    container: HTMLElement | undefined,
    actionContainer: HTMLElement | undefined,
  ) =>
  (props: P) => {
    const ctx = useJsonForms();
    const ajv = getAjv({ jsonforms: { ...ctx } });

    return (
      <Component
        {...props}
        ajv={ajv}
        container={container}
        actionContainer={actionContainer}
      />
    );
  };

export const materialCategorizationStepperLayoutWithPortal = (
  container: HTMLElement | undefined,
  actionContainer: HTMLElement | undefined,
) => ({
  tester: materialCategorizationStepperTester,
  renderer: withJsonFormsLayoutProps(
    withAjvProps(
      MaterialCategorizationStepperLayout,
      container,
      actionContainer,
    ),
  ),
});
