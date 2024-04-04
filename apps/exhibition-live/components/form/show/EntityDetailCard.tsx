import React, { FunctionComponent, useCallback } from "react";
import { JsonView } from "react-json-view-lite";
import { PrimaryFieldResults } from "../../utils/types";
import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material";
import { useTranslation } from "next-i18next";
import LobidAllPropTable from "../lobid/LobidAllPropTable";
import { useModifiedRouter } from "../../basic";
import { encodeIRI } from "../../utils/core";

import { typeIRItoTypeName } from "../../config";
import { useSettings } from "../../state/useLocalSettings";
import NiceModal from "@ebay/nice-modal-react";
import { EditEntityModal } from "../edit/EditEntityModal";
import { useModalRegistry } from "../../state";
import { EntityDetailCardProps } from "./EntityDetailCardProps";
import { StylizedDetailCard } from "./StylizedDetailCard";

export const EntityDetailCard: FunctionComponent<EntityDetailCardProps> = ({
  typeIRI,
  entityIRI,
  cardInfo,
  data,
  cardActionChildren,
  readonly,
  inlineEditing,
  onEditClicked,
  tableProps = {},
}) => {
  const { t } = useTranslation();

  const router = useModifiedRouter();
  const { registerModal } = useModalRegistry();
  const editEntry = useCallback(() => {
    const typeName = typeIRItoTypeName(typeIRI);
    if (inlineEditing === true) {
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
    inlineEditing,
    registerModal,
    data,
    onEditClicked,
  ]);

  const {
    features: { enableDebug },
  } = useSettings();

  return (
    <>
      {cardInfo.image && cardInfo.description ? (
        <StylizedDetailCard
          typeIRI={typeIRI}
          entityIRI={entityIRI}
          cardInfo={cardInfo}
          data={data}
          cardActionChildren={
            typeof cardActionChildren !== "undefined"
              ? cardActionChildren
              : !readonly && (
                  <Button
                    size="small"
                    color="primary"
                    variant={"outlined"}
                    onClick={editEntry}
                  >
                    {inlineEditing ? t("edit inline") : t("edit")}
                  </Button>
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
              <Typography gutterBottom variant="h5" component="div">
                {cardInfo.label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {cardInfo.description}
              </Typography>
            </CardContent>
          </CardActionArea>
          {cardActionChildren !== null && (
            <CardActions>
              {typeof cardActionChildren !== "undefined" ? (
                cardActionChildren
              ) : (
                <>
                  {!readonly && (
                    <Button size="small" color="primary" onClick={editEntry}>
                      {inlineEditing ? t("edit inline") : t("edit")}
                    </Button>
                  )}
                </>
              )}
            </CardActions>
          )}
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
