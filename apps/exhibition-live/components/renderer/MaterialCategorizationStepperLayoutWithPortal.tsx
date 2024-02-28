import React, { ComponentType, useCallback, useState } from "react";
import merge from "lodash/merge";
import {
  Box,
  Button,
  Grid,
  Hidden,
  MobileStepper,
  Step,
  StepButton,
  Stepper,
  Typography,
} from "@mui/material";
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
import { optionallyCreatePortal } from "../helper/optionallyCreatePortal";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import { useTranslation } from "next-i18next";

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
  actionContainer?: HTMLElement;
}

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
  const { t } = useTranslation();
  const childProps: MaterialLayoutRendererProps = {
    elements: categories[activeCategory].elements,
    schema,
    path,
    direction: "column",
    visible,
    renderers,
    cells,
  };
  const handleNext = useCallback(
    () => handleStep(activeCategory + 1),
    [activeCategory],
  );
  const handleBack = useCallback(
    () => handleStep(activeCategory - 1),
    [activeCategory],
  );
  return (
    <Hidden xsUp={!visible}>
      <Box>
        <Grid
          container
          spacing={4}
          wrap={"nowrap"}
          direction={{ md: "row", xs: "column" }}
        >
          <Grid item xs={2}>
            <Hidden mdDown>
              <Stepper
                activeStep={activeCategory}
                nonLinear
                orientation={"vertical"}
                sx={{ paddingTop: (theme) => theme.spacing(2) }}
              >
                {categories.map((e: Category, idx: number) => (
                  <Step key={e.label}>
                    <StepButton onClick={() => handleStep(idx)}>
                      {e.label}
                    </StepButton>
                  </Step>
                ))}
              </Stepper>
            </Hidden>
            <Hidden mdUp>
              <MobileStepper
                variant="text"
                steps={categories.length}
                position="static"
                activeStep={activeCategory}
                nextButton={
                  <Button
                    size="small"
                    onClick={handleNext}
                    disabled={activeCategory >= categories.length - 1}
                  >
                    weiter
                    <KeyboardArrowRight />
                  </Button>
                }
                backButton={
                  <Button
                    size="small"
                    onClick={handleBack}
                    disabled={activeCategory <= 0}
                  >
                    <KeyboardArrowLeft />
                    zurück
                  </Button>
                }
              />
              <Typography variant="h3">
                {categories[activeCategory].label}
              </Typography>
            </Hidden>
          </Grid>
          <Grid item xs={10}>
            <div>
              <MaterialLayoutRenderer {...childProps} />
            </div>
          </Grid>
        </Grid>
        {!!appliedUiSchemaOptions.showNavButtons
          ? optionallyCreatePortal(
              <Hidden mdDown>
                <Box
                  sx={{ width: "100%" }}
                  display={"flex"}
                  justifyContent={"space-between"}
                >
                  <Button
                    style={buttonStyle}
                    color="secondary"
                    variant="contained"
                    disabled={activeCategory <= 0}
                    onClick={handleBack}
                  >
                    zurück
                  </Button>
                  <Button
                    style={buttonNextStyle}
                    variant="contained"
                    color="primary"
                    disabled={activeCategory >= categories.length - 1}
                    onClick={handleNext}
                  >
                    weiter
                  </Button>
                </Box>
              </Hidden>,
              actionContainer,
            )
          : null}
      </Box>
    </Hidden>
  );
};
const withAjvProps =
  <P extends {}>(
    Component: ComponentType<AjvProps & P>,
    actionContainer: HTMLElement | undefined,
  ) =>
  (props: P) => {
    const ctx = useJsonForms();
    const ajv = getAjv({ jsonforms: { ...ctx } });

    return <Component {...props} ajv={ajv} actionContainer={actionContainer} />;
  };

export const materialCategorizationStepperLayoutWithPortal = (
  actionContainer?: HTMLElement | undefined,
) => ({
  tester: materialCategorizationStepperTester,
  renderer: withJsonFormsLayoutProps(
    withAjvProps(MaterialCategorizationStepperLayout, actionContainer),
  ),
});
