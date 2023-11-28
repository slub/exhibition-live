import React, { useCallback, useEffect, useState } from "react";
import {
  InputBase,
  Divider,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { Storage as KnowledgebaseIcon } from "@mui/icons-material";
import { Img } from "../utils/image/Img";
import { useTranslation } from "react-i18next";
import { useGlobalSearch } from "../state";

type KnowledgeSources = "kb" | "gnd" | "wikidata" | "k10plus" | "ai";
type SelectedEntity = {
  id: string;
  source: KnowledgeSources;
};

export const SearchForm = () => {
  const [selectedKnowledgeSources, setSelectedKnowledgeSources] = useState<
    KnowledgeSources[]
  >(["kb"]);
  const [entitySelected, setEntitySelected] = useState<
    SelectedEntity | undefined
  >();

  const { t } = useTranslation();

  const [value, setValue] = useState<string>("");
  const { search, setSearch } = useGlobalSearch();

  const handleKnowledgeSourceChange = useCallback(
    (
      event: React.MouseEvent<HTMLElement>,
      newKnowledgeSources: KnowledgeSources[],
    ) => {
      if (entitySelected) {
        setEntitySelected(undefined);
      }
      setSelectedKnowledgeSources(newKnowledgeSources);
    },
    [entitySelected, setEntitySelected, setSelectedKnowledgeSources],
  );

  const handleSearchTextChange = useCallback(
    (searchText: string | undefined) => {
      setSearch(searchText);
    },
    [setSearch],
  );

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue(event.target.value);
    },
    [setValue],
  );

  useEffect(() => {
    handleSearchTextChange(value);
  }, [value, handleSearchTextChange]);

  return (
    <Paper
      component="form"
      sx={{
        p: "2px 4px",
        display: "flex",
        alignItems: "center",
        width: "100%",
        boxShadow:
          "0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)",
        borderRadius: "4px",
      }}
    >
      <InputBase
        sx={{
          ml: 1,
          flex: 1,
        }}
        placeholder="Suchbegriff eingeben"
        inputProps={{
          "aria-label": "add label here",
        }}
        value={value}
        onChange={handleChange}
      />
      <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
      <ToggleButtonGroup
        size="small"
        value={selectedKnowledgeSources}
        onChange={handleKnowledgeSourceChange}
        aria-label="Suche über verschiedene Wissensquellen"
        sx={{
          cursor: "not-allowed",
        }}
      >
        <ToggleButton
          value="kb"
          aria-label="lokale Datenbank"
          sx={{
            border: 0,
            cursor: "not-allowed",
          }}
        >
          <KnowledgebaseIcon />
        </ToggleButton>
        <ToggleButton
          value="gnd"
          aria-label="GND"
          sx={{
            border: 0,
            cursor: "not-allowed",
          }}
        >
          <Img
            alt={"gnd logo"}
            width={24}
            height={24}
            src={"/Icons/gnd-logo.png"}
          />
        </ToggleButton>
      </ToggleButtonGroup>
    </Paper>
  );
};
