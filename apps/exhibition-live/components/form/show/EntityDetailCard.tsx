import React, { FunctionComponent, useCallback } from "react";
import useExtendedSchema from "../../state/useExtendedSchema";
import { useCRUDWithQueryClient } from "../../state/useCRUDWithQueryClient";
import { useGlobalCRUDOptions } from "../../state/useGlobalCRUDOptions";
import { defaultJsonldContext, defaultPrefix } from "../formConfigs";
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
import { useTranslation } from "react-i18next";
import LobidAllPropTable from "../lobid/LobidAllPropTable";
import { useModifiedRouter } from "../../basic";
import { encodeIRI } from "../../utils/core";

import { typeIRItoTypeName } from "../../config";

interface OwnProps {
  typeIRI: string;
  entityIRI: string;
  cardInfo: PrimaryFieldResults<string>;
  data: any;
}

type Props = OwnProps;
export const EntityDetailCard: FunctionComponent<Props> = ({
  typeIRI,
  entityIRI,
  cardInfo,
  data,
}) => {
  const { t } = useTranslation("translation");

  const router = useModifiedRouter();
  const editEntry = useCallback(() => {
    const typeName = typeIRItoTypeName(typeIRI);
    router.push(`/create/${typeName}?encID=${encodeIRI(entityIRI)}`);
  }, [router, typeIRI, entityIRI]);
  return (
    <>
      <Card>
        <CardActionArea>
          {cardInfo.image && (
            <CardMedia
              component="img"
              height="440"
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
        <CardActions>
          <Button size="small" color="primary" onClick={editEntry}>
            {t("edit")}
          </Button>
        </CardActions>
      </Card>
      <LobidAllPropTable allProps={data} />
      <JsonView data={cardInfo} shouldInitiallyExpand={(lvl) => lvl < 3} />
      <JsonView data={data} shouldInitiallyExpand={(lvl) => lvl < 3} />
    </>
  );
};
