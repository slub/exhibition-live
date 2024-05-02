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
import LobidAllPropTable from "../lobid/LobidAllPropTable";
import { useModifiedRouter } from "../../basic";
import { encodeIRI } from "@slub/edb-ui-utils";

import { typeIRItoTypeName } from "../../config";
import NiceModal from "@ebay/nice-modal-react";
import { EditEntityModal } from "../edit/EditEntityModal";
import { useModalRegistry, useSettings } from "@slub/edb-state-hooks";
import { EntityDetailCardProps } from "./EntityDetailCardProps";
import { StylizedDetailCard } from "./StylizedDetailCard";
import { isString } from "lodash";
import MarkdownContent from "./MarkdownContentNoSSR";
import { Edit } from "@mui/icons-material";

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

  const router = useModifiedRouter();
  const { registerModal } = useModalRegistry();
  const editEntry = useCallback(() => {
    const typeName = typeIRItoTypeName(typeIRI);
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
    registerModal,
    data,
    onEditClicked,
  ]);

  const {
    features: { enableDebug, enableStylizedCard },
  } = useSettings();

  return (
    <>
      {cardInfo.image && cardInfo.description && enableStylizedCard ? (
        <StylizedDetailCard
          typeIRI={typeIRI}
          entityIRI={entityIRI}
          cardInfo={cardInfo}
          data={data}
          cardActionChildren={
            typeof cardActionChildren !== "undefined"
              ? cardActionChildren
              : !readonly && (
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
                )
          }
        />
      ) : (
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
          <Box>{<MarkdownContent mdDocument={cardInfo.description} />}</Box>
        </Card>
      )}
      <LobidAllPropTable
        allProps={data}
        disableContextMenu
        inlineEditing={true}
        {...tableProps}
      />
      {enableDebug && (
        <>
          <JsonView data={cardInfo} shouldInitiallyExpand={(lvl) => lvl < 3} />
          <JsonView data={data} shouldInitiallyExpand={(lvl) => lvl < 3} />
        </>
      )}
    </>
  );
};
