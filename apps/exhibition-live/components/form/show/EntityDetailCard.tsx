import React, {
    FunctionComponent,
    useCallback,
    useMemo,
} from "react";
import useExtendedSchema from "../../state/useExtendedSchema";
import {JsonView} from "react-json-view-lite";
import {PrimaryFieldResults} from "../../utils/types";
import {
    Button,
    Card,
    CardActionArea,
    CardActions,
    CardContent,
    CardMedia,
    Typography,
} from "@mui/material";
import {useTranslation} from "next-i18next";
import LobidAllPropTable from "../lobid/LobidAllPropTable";
import {useModifiedRouter} from "../../basic";
import {encodeIRI} from "../../utils/core";

import {typeIRItoTypeName} from "../../config";
import {useSettings} from "../../state/useLocalSettings";
import {uischemas} from "../uischemas";
import {uischemata} from "../uischemaForType";

interface OwnProps {
    typeIRI: string;
    entityIRI: string;
    cardInfo: PrimaryFieldResults<string>;
    cardActionChildren?: React.ReactNode;
    data: any;
    readOnly?: boolean
}

type Props = OwnProps;
export const EntityDetailCard: FunctionComponent<Props> = ({
                                                               typeIRI,
                                                               entityIRI,
                                                               cardInfo,
                                                               data,
                                                               cardActionChildren,
                                                               readOnly
                                                           }) => {
    const {t} = useTranslation();

    const router = useModifiedRouter();
    const editEntry = useCallback(() => {
        const typeName = typeIRItoTypeName(typeIRI);
        router.push(`/create/${typeName}?encID=${encodeIRI(entityIRI)}`);
    }, [router, typeIRI, entityIRI]);
    const {
        features: {enableDebug},
    } = useSettings();

    const typeName = typeIRItoTypeName(typeIRI);
    const loadedSchema = useExtendedSchema({typeName, classIRI: typeIRI});
    const uischema = useMemo(
        () => uischemata[typeName] || (uischemas as any)[typeName],
        [typeName],
    );

    return (
        <>
            <Card>
                <CardActionArea>
                    {cardInfo.image && (
                        <CardMedia
                            component="img"
                            sx={{maxHeight: "24em", objectFit: "contain"}}
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
                    typeof cardActionChildren !== 'undefined' && !readOnly ? cardActionChildren : <>
                        <Button size="small" color="primary" onClick={editEntry}>
                            {t("edit")}
                        </Button>
                    </>
                }
                </CardActions>}
            </Card>
            <LobidAllPropTable allProps={data}/>
            {enableDebug && (
                <>
                    <JsonView
                        data={cardInfo}
                        shouldInitiallyExpand={(lvl) => lvl < 3}
                    />
                    <JsonView data={data} shouldInitiallyExpand={(lvl) => lvl < 3}/>
                </>
            )}
        </>
    );
};
