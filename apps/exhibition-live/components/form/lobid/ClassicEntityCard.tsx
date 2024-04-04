import { ArrowBack } from "@mui/icons-material";
import {
  Box,
  BoxProps,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  IconButton,
  Typography,
} from "@mui/material";
import React, { FunctionComponent } from "react";

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
  detailView?: React.ReactNode;
  cardActionChildren?: React.ReactNode;
};

const ClassicEntityCard: FunctionComponent<Props & Partial<BoxProps>> = ({
  data,
  id,
  onBack,
  cardActionChildren,
  detailView,
  ...rest
}) => {
  const _label = data.label || data.title || data.name || id;

  return (
    <Box {...rest}>
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
        {cardActionChildren && <CardActions>{cardActionChildren}</CardActions>}
        {detailView || null}
      </Card>
    </Box>
  );
};
export default ClassicEntityCard;
