import { KnowledgeBaseDescription } from "./types";
import * as React from "react";
import { useMemo } from "react";
import {
  Badge,
  Box,
  Divider,
  Grid,
  TextField,
  TextFieldProps,
} from "@mui/material";
import { useAdbContext } from "@slub/edb-state-hooks";
import { useTranslation } from "next-i18next";

export const SearchFieldWithBadges = ({
  searchString,
  typeIRI,
  onSearchStringChange,
  selectedKnowledgeSources,
  toggleKnowledgeSource,
  knowledgeBases,
  advancedConfigChildren,
  ...rest
}: {
  searchString: string;
  typeIRI: string;
  onSearchStringChange: (value: string) => void;
  knowledgeBases: KnowledgeBaseDescription[];
  selectedKnowledgeSources: string[];
  toggleKnowledgeSource?: (source: string) => void;
  advancedConfigChildren?: React.ReactNode;
} & Partial<TextFieldProps>) => {
  const { typeIRIToTypeName } = useAdbContext();
  const typeName = useMemo(
    () => typeIRIToTypeName(typeIRI),
    [typeIRI, typeIRIToTypeName],
  );
  const { t } = useTranslation();
  return (
    <Grid
      container
      spacing={2}
      sx={{
        m: 2,
        px: 2,
        py: 1,
        width: "auto",
        border: 1,
        borderColor: "primary.main",
        borderRadius: "4px",
      }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <TextField
          variant={"standard"}
          fullWidth={true}
          value={searchString || ""}
          onChange={(e) => onSearchStringChange(e.currentTarget.value)}
          label={`Suche in ${selectedKnowledgeSources.join(",")} nach ${t(
            typeName,
          )} `}
          {...rest}
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
        {knowledgeBases.map(({ id, label, icon }) => {
          return (
            <Badge
              key={id}
              color="primary"
              sx={{ m: 0.5 }}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              variant="dot"
              overlap="circular"
              invisible={!selectedKnowledgeSources?.includes(id)}
            >
              {icon}
            </Badge>
          );
        })}
        {advancedConfigChildren && (
          <>
            <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
            {advancedConfigChildren}
          </>
        )}
      </Box>
    </Grid>
  );
};
