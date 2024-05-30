import React, { FunctionComponent, useCallback } from "react";
import { JsonView } from "react-json-view-lite";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  IconButton,
  Typography,
} from "@mui/material";
import { useTranslation } from "next-i18next";
import { AllPropTableProps, LobidAllPropTable } from "../table";
import { encodeIRI } from "@slub/edb-ui-utils";

import NiceModal from "@ebay/nice-modal-react";
import {
  useAdbContext,
  useModalRegistry,
  useModifiedRouter,
  useSettings,
} from "@slub/edb-state-hooks";
import { isString } from "lodash";
import { Edit } from "@mui/icons-material";
import { PrimaryFieldResults } from "@slub/edb-core-types";

type OwnProps = {
  typeIRI: string;
  entityIRI: string;
  cardInfo: PrimaryFieldResults<string>;
  cardActionChildren?: React.ReactNode;
  data: any;
  readonly?: boolean;
  disableInlineEditing?: boolean;
  onEditClicked?: () => void;
  tableProps?: Partial<AllPropTableProps>;
};

export type EntityDetailCardProps = OwnProps;
export const EntityDetailCard: FunctionComponent<EntityDetailCardProps> = ({
  typeIRI,
  entityIRI,
  cardInfo,
  data,
  cardActionChildren,
  readonly,
  disableInlineEditing,
  onEditClicked,
  tableProps = {},
}) => {
  const { t } = useTranslation();
  const {
    typeIRIToTypeName,
    components: { EditEntityModal },
  } = useAdbContext();

  const router = useModifiedRouter();
  const { registerModal } = useModalRegistry(NiceModal);
  const editEntry = useCallback(() => {
    const typeName = typeIRIToTypeName(typeIRI);
    if (!disableInlineEditing) {
      const modalID = `edit-${typeIRI}-${entityIRI}`;
      registerModal(modalID, EditEntityModal);
      NiceModal.show(modalID, {
        entityIRI: entityIRI,
        typeIRI: typeIRI,
        data,
        disableLoad: true,
      });
    } else {
      router.push(`/create/${typeName}?encID=${encodeIRI(entityIRI)}`);
    }
    onEditClicked && onEditClicked();
  }, [
    router,
    typeIRI,
    entityIRI,
    disableInlineEditing,
    typeIRIToTypeName,
    registerModal,
    data,
    onEditClicked,
    EditEntityModal,
  ]);

  const {
    features: { enableDebug, enableStylizedCard },
  } = useSettings();

  return (
    <>
      <Card>
        <CardActionArea>
          {cardInfo.image && (
            <CardMedia
              component="img"
              sx={{ maxHeight: "24em", objectFit: "contain" }}
              image={cardInfo.image}
              alt={cardInfo.label}
            />
          )}
          <CardContent>
            <Typography gutterBottom variant="h1" component="div">
              {cardInfo.label}
            </Typography>
            {isString(data?.originalTitle) ||
              isString(data?.subtitle) ||
              (cardInfo.description?.length < 300 && (
                <Typography variant="body2" color="text.secondary">
                  {data?.subtitle ||
                    data?.originalTitle ||
                    cardInfo.description}
                </Typography>
              ))}
          </CardContent>
        </CardActionArea>
        {cardActionChildren !== null && (
          <CardActions>
            {typeof cardActionChildren !== "undefined" ? (
              cardActionChildren
            ) : (
              <>
                {!readonly && (
                  <IconButton
                    component={Button}
                    size="small"
                    color="primary"
                    variant={"outlined"}
                    onClick={editEntry}
                    startIcon={<Edit />}
                  >
                    {!disableInlineEditing ? t("edit inline") : t("edit")}
                  </IconButton>
                )}
              </>
            )}
          </CardActions>
        )}
        <Box>
          {/*
        <MarkdownContent mdDocument={cardInfo.description} />
          */}
        </Box>
      </Card>
      <LobidAllPropTable
        allProps={data}
        disableContextMenu
        inlineEditing={true}
        {...tableProps}
      />
      {enableDebug && (
        <>
          <JsonView data={cardInfo} shouldExpandNode={(lvl) => lvl < 3} />
          <JsonView data={data} shouldExpandNode={(lvl) => lvl < 3} />
        </>
      )}
    </>
  );
};
