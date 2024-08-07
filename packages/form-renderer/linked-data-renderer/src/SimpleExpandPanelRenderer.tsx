import { JsonSchema, update } from "@jsonforms/core";
import {
  Avatar,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Stack,
} from "@mui/material";
import React, { useCallback, useEffect, useMemo } from "react";

import { Clear, Save } from "@mui/icons-material";
import { applyToEachField, extractFieldIfString } from "@slub/edb-data-mapping";
import { JSONSchema7 } from "json-schema";
import { useJsonForms } from "@jsonforms/react";
import dot from "dot";
import { useAdbContext, useCRUDWithQueryClient } from "@slub/edb-state-hooks";
import get from "lodash/get";
import NiceModal from "@ebay/nice-modal-react";
import { withEllipsis } from "@slub/edb-ui-utils";
import { specialDate2LocalDate } from "@slub/edb-ui-utils";
import { useTranslation } from "next-i18next";
import { bringDefinitionToTop } from "@slub/json-schema-utils";
import { PrimaryFieldDeclaration } from "@slub/edb-core-types";

type SimpleExpandPanelRendererProps = {
  data: any;
  entityIRI: string;
  typeIRI: string;
  typeName: string;
  index: number;
  count: number;
  schema: JsonSchema;
  rootSchema: JsonSchema;
  onRemove: (entityIRI: string) => void;
  onChange: (data: any) => void;
  path: string;
  childLabelTemplate?: string;
  elementDetailItemPath?: string;
  elementLabelProp?: string;
  imagePath?: string;
  formsPath?: string;
  primaryFields: PrimaryFieldDeclaration;
};
export const SimpleExpandPanelRenderer = (
  props: SimpleExpandPanelRendererProps,
) => {
  const { dispatch, config } = useJsonForms();
  const {
    data,
    entityIRI,
    schema,
    rootSchema,
    onRemove,
    count,
    childLabelTemplate,
    imagePath,
    elementLabelProp,
    elementDetailItemPath,
    typeIRI,
    typeName,
    primaryFields,
  } = props;
  const onData = useCallback((_data) => {
    dispatch(update(props.path, () => _data));
  }, []);
  const {
    components: { EntityDetailModal },
  } = useAdbContext();
  // @ts-ignore
  const { label, description, image } = useMemo(() => {
    let imageUrl = null;
    if (imagePath) {
      imageUrl = get(data, imagePath);
    }
    if (!typeName) return {};
    const fieldDecl = primaryFields[typeName];
    if (data && fieldDecl) {
      const extratedInfo = applyToEachField(
        data,
        fieldDecl,
        extractFieldIfString,
      );
      return {
        image: imageUrl || extratedInfo.image,
        ...extratedInfo,
      };
    }
    return { image: imageUrl };
  }, [data, typeName, entityIRI]);

  const {
    i18n: { language: locale },
  } = useTranslation();

  const subSchema = useMemo(
    () =>
      bringDefinitionToTop(rootSchema as JSONSchema7, typeName) as JSONSchema7,
    [rootSchema, typeName],
  );
  const realLabel = useMemo(() => {
    if (childLabelTemplate) {
      try {
        const template = dot.template(childLabelTemplate);
        //we would need a middleware but it is hard to get the date converted correctly here
        const modifiedData = Object.fromEntries(
          Object.entries(data).map(([key, value]: [string, any]) => {
            if (
              key.toLowerCase().includes("date") &&
              typeof value === "number"
            ) {
              return [key, specialDate2LocalDate(value, locale)];
            }
            return [key, value];
          }),
        );
        return template(modifiedData);
      } catch (e) {
        console.warn("could not render childLabelTemplate", e);
      }
    } else if (elementLabelProp) {
      const label_ = get(data, elementLabelProp);
      if (label_) return label_;
    }
    return label || data?.__label;
  }, [childLabelTemplate, elementLabelProp, data, label, locale]);

  const elementDetailItem = useMemo(
    () => (elementDetailItemPath ? get(data, elementDetailItemPath) : null),
    [elementDetailItemPath, data],
  );

  const { loadQuery, saveMutation } = useCRUDWithQueryClient({
    entityIRI,
    typeIRI,
    schema: subSchema,
    queryOptions: {
      enabled: !data?.__draft && !data?.__label,
      initialData: data,
      refetchOnWindowFocus: true,
    },
  });
  const draft = data?.__draft && !saveMutation.isSuccess;
  const { data: loadedData } = loadQuery;
  useEffect(() => {
    if (loadedData?.document) {
      onData(loadedData.document);
    }
  }, [loadedData, onData]);

  const handleSave = useCallback(async () => {
    if (!saveMutation) return;
    saveMutation.mutate(data);
  }, [saveMutation, data]);

  const showDetailModal = useCallback(() => {
    if (elementDetailItem?.["@id"] && elementDetailItem?.["@type"]) {
      NiceModal.show(EntityDetailModal, {
        typeIRI: elementDetailItem["@type"],
        entityIRI: elementDetailItem["@id"],
        data: elementDetailItem,
        inlineEditing: true,
      });
    } else {
      NiceModal.show(EntityDetailModal, {
        typeIRI,
        entityIRI,
        data,
        inlineEditing: true,
      });
    }
  }, [typeIRI, entityIRI, data, elementDetailItem]);

  return (
    <ListItem
      secondaryAction={
        <Stack direction="row" spacing={1}>
          {draft && (
            <IconButton onClick={handleSave} aria-label={"Save"} size="large">
              <Save />
            </IconButton>
          )}
          <IconButton
            aria-label={"Delete"}
            size="large"
            onClick={() => onRemove && onRemove(entityIRI)}
          >
            <Clear />
          </IconButton>
        </Stack>
      }
    >
      <ListItemButton onClick={!draft ? showDetailModal : undefined}>
        <ListItemAvatar>
          <Avatar aria-label="Index" src={image}>
            {count + 1}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primaryTypographyProps={{ style: { whiteSpace: "normal" } }}
          secondaryTypographyProps={{ style: { whiteSpace: "normal" } }}
          primary={withEllipsis(realLabel, 80)}
          secondary={withEllipsis(description, 100)}
        />
      </ListItemButton>
    </ListItem>
  );
};
