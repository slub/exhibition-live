import { JsonView } from "react-json-view-lite";
import { Divider, Grid, Typography } from "@mui/material";
import React from "react";

type FormDebuggingToolsProps = {
  jsonData?: Record<string, any>;
};
const FormDebuggingTools = ({ jsonData }: FormDebuggingToolsProps) => {
  return (
    <Grid container direction={"column"} spacing={2}>
      {Object.entries(jsonData).map(([key, value]) => {
        return (
          <Grid item key={key}>
            <Typography variant={"h6"}>{key}</Typography>
            <JsonView data={value} shouldInitiallyExpand={(lvl) => lvl < 5} />
            <Divider />
          </Grid>
        );
      })}
    </Grid>
  );
};
