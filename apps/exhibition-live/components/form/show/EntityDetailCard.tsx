import React, {
  FunctionComponent,
  useCallback,
  useMemo,
  useState,
} from "react";
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
import { useTranslation } from "next-i18next";
import LobidAllPropTable from "../lobid/LobidAllPropTable";
import { useModifiedRouter } from "../../basic";
import { encodeIRI } from "../../utils/core";

import { typeIRItoTypeName } from "../../config";
import { useSettings } from "../../state/useLocalSettings";
import NewSemanticJsonForm from "../SemanticJsonForm";
import { JSONSchema7 } from "json-schema";
import { uischemas } from "../uischemas";
import { uischemata } from "../uischemaForType";

interface OwnProps {
  typeIRI: string;
  entityIRI: string;
  cardInfo: PrimaryFieldResults<string>;
  cardActionChildren?: React.ReactNode;
  data: any;
}

type Props = OwnProps;
export const EntityDetailCard: FunctionComponent<Props> = ({
  typeIRI,
  entityIRI,
  cardInfo,
  data,
  cardActionChildren,
}) => {
  const { t } = useTranslation();

  const router = useModifiedRouter();
  const [editMode, setEditMode] = useState(false);
  const editEntry = useCallback(() => {
    const typeName = typeIRItoTypeName(typeIRI);
    router.push(`/create/${typeName}?encID=${encodeIRI(entityIRI)}`);
  }, [router, typeIRI, entityIRI]);
  const {
    features: { enableDebug },
  } = useSettings();

  const editInlineEntry = useCallback(() => {
    setEditMode(true);
  }, []);
  const [formData, setFormData] = useState<any>(data);
  const typeName = typeIRItoTypeName(typeIRI);
  const loadedSchema = useExtendedSchema({ typeName, classIRI: typeIRI });
  const { crudOptions } = useGlobalCRUDOptions();
  const uischema = useMemo(
    () => uischemata[typeName] || (uischemas as any)[typeName],
    [typeName],
  );

  return (
    <>
      {editMode ? (
        <NewSemanticJsonForm
          data={formData}
          onChange={setFormData}
          entityIRI={data["@id"]}
          typeIRI={typeIRI}
          crudOptions={crudOptions}
          defaultPrefix={defaultPrefix}
          searchText={""}
          shouldLoadInitially
          jsonldContext={defaultJsonldContext}
          schema={loadedSchema as JSONSchema7}
          jsonFormsProps={{
            uischema,
            uischemas: uischemas,
          }}
          enableSidebar={false}
          disableSimilarityFinder={true}
          wrapWithinCard={true}
        />
      ) : (
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
                <Typography gutterBottom variant="h5" component="div">
                  {cardInfo.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {cardInfo.description}
                </Typography>
              </CardContent>
            </CardActionArea>
            {cardActionChildren !== null && <CardActions>{
              typeof cardActionChildren !== 'undefined' ? cardActionChildren : <>
                <Button size="small" color="primary" onClick={editEntry}>
                  {t("edit")}
                </Button>
                <Button size="small" color="primary" onClick={editInlineEntry}>
                  {t("edit inline")}
                </Button>
              </>
            }
            </CardActions>}
          </Card>
          <LobidAllPropTable allProps={data} />
          {enableDebug && (
            <>
              <JsonView
                data={cardInfo}
                shouldInitiallyExpand={(lvl) => lvl < 3}
              />
              <JsonView data={data} shouldInitiallyExpand={(lvl) => lvl < 3} />
            </>
          )}
        </>
      )}
    </>
  );
};
