import { JsonView } from "react-json-view-lite";
import { Divider, Grid, Typography } from "@mui/material";
import React from "react";
import { useSettings } from "@slub/edb-state-hooks";
import { useGlobalCRUDOptions } from "@slub/edb-state-hooks";
import { SPARQLLocalOxigraphToolkit } from "./SPARQLLocalOxigraphToolkit";

type FormDebuggingToolsProps = {
  jsonData?: Record<string, any>;
};
export const FormDebuggingTools = ({ jsonData }: FormDebuggingToolsProps) => {
  const { features } = useSettings();
  const { doLocalQuery } = useGlobalCRUDOptions();
  if (!features?.enableDebug) return null;

  return (
    <Grid container direction={"column"} spacing={2}>
      {Object.entries(jsonData).map(([key, value]) => {
        return (
          <Grid item key={key}>
            <Typography variant={"h3"}>{key}</Typography>
            <JsonView data={value} shouldExpandNode={(lvl) => lvl < 5} />
            <Divider />
          </Grid>
        );
      })}
      <Grid item>
        <SPARQLLocalOxigraphToolkit sparqlQuery={doLocalQuery} />
      </Grid>
    </Grid>
  );
};
