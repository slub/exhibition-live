import {
  composePaths,
  ControlElement,
  createId,
  findUISchema,
  getFirstPrimitiveProp,
  JsonFormsCellRendererRegistryEntry,
  JsonFormsRendererRegistryEntry,
  JsonFormsUISchemaRegistryEntry,
  JsonSchema,
  moveDown,
  moveUp,
  rankWith,
  removeId,
  Resolve,
  UISchemaElement,
  update,
} from "@jsonforms/core";
import {
  JsonFormsDispatch,
  JsonFormsStateContext,
  useJsonForms,
  withJsonFormsContext,
} from "@jsonforms/react";
import ArrowDownward from "@mui/icons-material/ArrowDownward";
import ArrowUpward from "@mui/icons-material/ArrowUpward";
import EditIcon from "@mui/icons-material/Create";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Grid,
  IconButton,
} from "@mui/material";
import { isEmpty } from "lodash";
import get from "lodash/get";
import merge from "lodash/merge";
import React, {
  ComponentType,
  Dispatch,
  Fragment,
  ReducerAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import InlineSemanticFormsRenderer from "./InlineSemanticFormsRenderer";
import InlineSemanticFormsRendererModal from "./InlineSemanticFormsRendererModal";
import find from "lodash/find";
import { useSPARQL_CRUD } from "../state/useSPARQL_CRUD";
import { defaultPrefix, defaultQueryBuilderOptions } from "../form/formConfigs";
import { useGlobalCRUDOptions } from "../state/useGlobalCRUDOptions";

const iconStyle: any = { float: "right" };

import dot from "dot";
import { memo } from "./config";
import { Save } from "@mui/icons-material";

interface OwnPropsOfExpandPanel {
  index?: number;
  path: string;
  uischema: ControlElement;
  schema: JsonSchema;
  expanded: boolean;
  renderers?: JsonFormsRendererRegistryEntry[];
  cells?: JsonFormsCellRendererRegistryEntry[];
  uischemas?: JsonFormsUISchemaRegistryEntry[];
  rootSchema: JsonSchema;
  enableMoveUp: boolean;
  enableMoveDown: boolean;
  config: any;
  childLabelProp?: string;
  childLabelTemplate?: string;
  handleExpansion(panel: string): (event: any, expanded: boolean) => void;
  readonly?: boolean;
  draft?: boolean;
  saveItem?: () => void;
  data?: any;
}

interface StatePropsOfExpandPanel extends OwnPropsOfExpandPanel {
  childLabel: string;
  childPath?: string;
  avatar: string;
  entityIRI: string;
  typeIRI: string;
  enableMoveUp: boolean;
  enableMoveDown: boolean;
}

/**
 * Dispatch props of a table control
 */
export interface DispatchPropsOfExpandPanel {
  removeItems(path: string, toDelete: number[]): (event: any) => void;
  moveUp(path: string, toMove: number): (event: any) => void;
  moveDown(path: string, toMove: number): (event: any) => void;
}

export interface ExpandPanelProps
  extends StatePropsOfExpandPanel,
    DispatchPropsOfExpandPanel {}

const ExpandPanelRendererComponent = (props: ExpandPanelProps) => {
  const [labelHtmlId] = useState<string>(createId("expand-panel"));

  useEffect(() => {
    return () => {
      removeId(labelHtmlId);
    };
  }, [labelHtmlId]);

  const {
    childLabel,
    childPath,
    index,
    expanded,
    moveDown,
    moveUp,
    enableMoveDown,
    enableMoveUp,
    handleExpansion,
    removeItems,
    saveItem,
    path,
    rootSchema,
    schema,
    uischema,
    uischemas,
    renderers,
    cells,
    config,
    readonly,
    avatar,
    entityIRI,
    typeIRI,
    draft,
    data,
  } = props;

  const foundUISchema = useMemo(
    () =>
      findUISchema(
        uischemas || [],
        schema,
        uischema.scope,
        path,
        undefined,
        uischema,
        rootSchema,
      ),
    [uischemas, schema, uischema.scope, path, uischema, rootSchema],
  );

  const appliedUiSchemaOptions = merge({}, config, uischema.options);
  const handleRemove = useCallback(
    (e) => {
      console.log({ path, index });
      removeItems(path, [index])(e);
    },
    [path, index],
  );

  return (
    <Accordion
      aria-labelledby={labelHtmlId}
      expanded={expanded}
      onChange={(event: React.SyntheticEvent, expanded: boolean) =>
        !draft && handleExpansion(childPath)(event, expanded)
      }
      className={"inline_object_card"}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Grid container alignItems={"center"}>
          <Grid item xs={7} md={9}>
            <Grid container alignItems={"center"}>
              <Grid item xs={2} md={1}>
                <Avatar aria-label="Index" src={avatar}>
                  {index + 1}
                </Avatar>
              </Grid>
              <Grid item xs={10} md={11}>
                <span id={labelHtmlId}>{childLabel}</span>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={5} md={3}>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Grid
                  container
                  direction="row"
                  justifyContent="center"
                  alignItems="center"
                  sx={{ visibility: readonly ? "hidden" : "visible" }}
                >
                  {appliedUiSchemaOptions.showSortButtons ? (
                    <Fragment>
                      <Grid item>
                        <IconButton
                          onClick={moveUp(path, index)}
                          style={iconStyle}
                          disabled={!enableMoveUp}
                          aria-label={"Move up"}
                          size="large"
                        >
                          <ArrowUpward />
                        </IconButton>
                      </Grid>
                      <Grid item>
                        <IconButton
                          onClick={moveDown(path, index)}
                          style={iconStyle}
                          disabled={!enableMoveDown}
                          aria-label={"Move down"}
                          size="large"
                        >
                          <ArrowDownward />
                        </IconButton>
                      </Grid>
                    </Fragment>
                  ) : (
                    ""
                  )}
                  <Grid item style={{ paddingTop: "1rem" }}>
                    {draft ? (
                      <IconButton
                        onClick={saveItem}
                        style={iconStyle}
                        aria-label={"Save"}
                        size="large"
                      >
                        <Save />
                      </IconButton>
                    ) : (
                      <JsonFormsDispatch
                        schema={schema}
                        uischema={foundUISchema}
                        path={childPath}
                        key={entityIRI}
                        renderers={[
                          ...(renderers || []),
                          {
                            tester: rankWith(
                              15,
                              (uischema: UISchemaElement): boolean => {
                                if (isEmpty(uischema)) {
                                  return false;
                                }
                                const options = uischema.options;
                                return !isEmpty(options) && options["inline"];
                              },
                            ),
                            renderer: InlineSemanticFormsRendererModal,
                          },
                        ]}
                        cells={cells}
                      />
                    )}
                  </Grid>
                  <Grid item>
                    <IconButton
                      onClick={handleRemove}
                      style={iconStyle}
                      aria-label={"Delete"}
                      size="large"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </AccordionSummary>
      {!draft && (
        <AccordionDetails>
          {expanded && (
            <JsonFormsDispatch
              schema={schema}
              uischema={foundUISchema}
              path={childPath}
              key={childPath}
              renderers={[
                ...(renderers || []),
                {
                  tester: rankWith(15, (uischema: UISchemaElement): boolean => {
                    if (isEmpty(uischema)) {
                      return false;
                    }
                    const options = uischema.options;
                    return !isEmpty(options) && options["inline"];
                  }),
                  renderer: InlineSemanticFormsRenderer,
                },
              ]}
              cells={cells}
            />
          )}
        </AccordionDetails>
      )}
    </Accordion>
  );
};

const ExpandPanelRenderer = memo(ExpandPanelRendererComponent);

/**
 * Maps state to dispatch properties of an expand pandel control.
 *
 * @param dispatch the store's dispatch method
 * @returns {DispatchPropsOfArrayControl} dispatch props of an expand panel control
 */
export const ctxDispatchToExpandPanelProps: (
  dispatch: Dispatch<ReducerAction<any>>,
) => DispatchPropsOfExpandPanel = (dispatch) => ({
  removeItems: useCallback(
    (path: string, toDelete: number[]) =>
      (event: any): void => {
        event.stopPropagation();
        dispatch(
          update(path, (array) => {
            toDelete
              .sort()
              .reverse()
              .forEach((s) => array.splice(s, 1));
            return array;
          }),
        );
      },
    [dispatch],
  ),
  moveUp: useCallback(
    (path: string, toMove: number) =>
      (event: any): void => {
        event.stopPropagation();
        dispatch(
          update(path, (array) => {
            moveUp(array, toMove);
            return array;
          }),
        );
      },
    [dispatch],
  ),
  moveDown: useCallback(
    (path: string, toMove: number) =>
      (event: any): void => {
        event.stopPropagation();
        dispatch(
          update(path, (array) => {
            moveDown(array, toMove);
            return array;
          }),
        );
      },
    [dispatch],
  ),
});

export const getFirstPrimitivePropExceptJsonLD = (schema: any) => {
  if (schema.properties) {
    return find(Object.keys(schema.properties), (propName) => {
      const prop = schema.properties[propName];
      return (
        (prop.type === "string" ||
          prop.type === "number" ||
          prop.type === "integer") &&
        !propName.startsWith("@")
      );
    });
  }
  return undefined;
};
/**
 * Map state to control props.
 * @param state the JSON Forms state
 * @param ownProps any own props
 * @returns {StatePropsOfControl} state props for a control
 */

export const withContextToExpandPanelProps =
  (
    Component: ComponentType<ExpandPanelProps>,
    // @ts-ignore
  ): ComponentType<OwnPropsOfExpandPanel> =>
  ({ ctx, props }: JsonFormsStateContext & ExpandPanelProps) => {
    const dispatchProps = ctxDispatchToExpandPanelProps(ctx.dispatch);
    const {
      childLabelTemplate,
      childLabelProp,
      schema,
      path,
      index,
      uischemas,
      data: childData,
    } = props;
    const childPath = composePaths(path, `${index}`);
    //const childData = Resolve.data(ctx.core.data, childPath);
    const [jsonldData, setJsonldData] = useState<any>(childData);
    useEffect(() => {
      console.log("childData", childData);
      setJsonldData((data) => {
        if (childData?.["@id"] !== data?.["@id"]) setJsonldData(childData);
        return {
          ...(data || {}),
          ...childData,
        };
      });
    }, [childData, setJsonldData]);

    useEffect(() => {
      console.log("jsonldData", jsonldData);
    }, []);

    let childLabel = null;
    if (childData && childData["__label"]) {
      childLabel = childData["__label"];
    } else if (childLabelTemplate) {
      try {
        const template = dot.template(childLabelTemplate);
        childLabel = template(jsonldData || childData);
      } catch (e) {
        console.warn("could not render childLabelTemplate", e);
      }
    } else if (childLabelProp) {
      childLabel = get(jsonldData || childData, childLabelProp, "");
    } else {
      // @ts-ignore
      childLabel = get(
        jsonldData || childData,
        getFirstPrimitivePropExceptJsonLD(schema),
        "",
      );
    }
    const avatar =
      get(jsonldData || childData, "image") ||
      get(jsonldData || childData, "logo");

    const entityIRI = get(childData, "@id");
    const typeIRI = get(childData, "@type");

    const { crudOptions, doLocalQuery } = useGlobalCRUDOptions();
    /*
    const { load, save, ready, isLoading } = useSPARQL_CRUD(
      entityIRI,
      typeIRI,
      schema,
      //@ts-ignore
      {
        ...crudOptions,
        defaultPrefix,
        setData: setJsonldData,
        queryBuildOptions: defaultQueryBuilderOptions,
        queryOptions: {
          enabled: !childData.__draft,
        }
      },
    );
*/
    const handleSaveItem = useCallback(async () => {
      //await save()
    }, []);

    return (
      <Component
        {...props}
        {...dispatchProps}
        childPath={childPath}
        childLabel={childLabel || ""}
        uischemas={uischemas}
        avatar={avatar}
        entityIRI={entityIRI}
        typeIRI={typeIRI}
        draft={childData.__draft}
        saveItem={handleSaveItem}
      />
    );
  };

export const withJsonFormsExpandPanelProps = (
  Component: ComponentType<ExpandPanelProps>,
): ComponentType<OwnPropsOfExpandPanel> =>
  withJsonFormsContext(withContextToExpandPanelProps(Component));

export default withJsonFormsExpandPanelProps(ExpandPanelRenderer);
