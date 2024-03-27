import { ArrowBack, ExpandLess, ExpandMore } from "@mui/icons-material";
import {
  Box,
  BoxProps,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  IconButton,
  Typography,
} from "@mui/material";
import React, { FunctionComponent, useCallback, useState } from "react";

export type EntityCardData = Partial<{
  id: string;
  label: string;
  title: string;
  name: string;
  description: string;
  avatar: string;
  allProps: any;
}>;

type Props = {
  data: EntityCardData;
  id: string;
  onBack?: () => void;
  onAcceptItem?: (id: string | undefined, data: any) => void;
  detailView?: React.ReactNode;
  acceptTitle: string;
};

const ClassicEntityCard: FunctionComponent<Props  & Partial<BoxProps>> = ({
  data,
  id,
  onBack,
  onAcceptItem,
  detailView,
  acceptTitle,
  ...rest
}) => {
  const _label = data.label || data.title || data.name || id;


  return (
    <Box {...rest} >
      {onBack && (
        <IconButton onClick={onBack}>
          <ArrowBack />
        </IconButton>
      )}
      <Card>
        {data.avatar && (
          <CardMedia
            component="img"
            alt={"Image of " + _label}
            height="300"
            image={data.avatar}
          />
        )}
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {_label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data.description}
          </Typography>
        </CardContent>
        <CardActions>
          {onAcceptItem && (
            <Button
              size="small"
              color="primary"
              variant="contained"
              onClick={() => onAcceptItem(data?.id, data)}
            >
              {acceptTitle}
            </Button>
          )}
        </CardActions>
        { detailView || null}
      </Card>
    </Box>
  );
};
export default ClassicEntityCard;
