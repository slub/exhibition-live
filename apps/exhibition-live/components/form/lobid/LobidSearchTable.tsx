import { Button, List, useControlled } from "@mui/material";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  findEntityWithinLobid,
  findEntityWithinLobidByIRI,
} from "@slub/edb-ui-utils";
import { filterUndefOrNull } from "@slub/edb-ui-utils";
import { applyToEachField, extractFieldIfString } from "@slub/edb-ui-utils";
import { useQuery } from "@tanstack/react-query";
import { lobidTypemap, typeIRItoTypeName } from "../../config";
import Ajv from "ajv";
import { useTranslation } from "next-i18next";
import {
  BasicThingInformation,
  PrimaryFieldExtract,
  PrimaryFieldExtractDeclaration,
} from "@slub/edb-core-types";
import {
  ClassicEntityCard,
  ClassicResultListItem,
} from "@slub/edb-basic-components";
import {
  LobidAllPropTable,
  WikidataAllPropTable,
} from "@slub/edb-advanced-components";

type Props = {
  searchString: string;
  typeIRI: string;
  selectedId?: string | null;
  onSelect?: (id: string | undefined) => void;
  onAcceptItem?: (id: string | undefined, data: any) => void;
};

type LobIDEntry = {
  id: string;
  [key: string]: any;
};

const nullOnEmpty = (arr: any[]) => (arr.length > 0 ? arr : null);

const defaultGndPrimaryFieldExtract: PrimaryFieldExtract<any> = {
  label: "preferredName",
  image: (entry: any) => entry.depiction?.[0]?.thumbnail,
};

const gndPrimaryFields: PrimaryFieldExtractDeclaration = {
  DifferentiatedPerson: {
    label: "preferredName",
    description: (entry: any) => {
      const dateOfBirth = entry?.dateOfBirth?.[0],
        dateOfDeath = entry?.dateOfDeath?.[0],
        dateOfBirthAndDeath =
          entry?.dateOfBirthAndDeath?.[0] ||
          nullOnEmpty(filterUndefOrNull([dateOfBirth, dateOfDeath]))?.join(
            " - ",
          ),
        profession = Array.isArray(entry.professionOrOccupation)
          ? filterUndefOrNull(
              entry.professionOrOccupation.map(
                ({ label }: { label: any }) => label,
              ),
            ).join(",")
          : null;
      return nullOnEmpty(
        filterUndefOrNull([dateOfBirthAndDeath, profession]),
      )?.join(" | ");
    },
    image: (entry: any) => entry.depiction?.[0]?.thumbnail,
  },
};

const getFirstMatchingFieldDeclaration = <T,>(
  type: string[],
  fieldDeclaration: PrimaryFieldExtractDeclaration<T>,
): PrimaryFieldExtract<T> | null => {
  const key = Object.keys(fieldDeclaration).find((key) => type.includes(key));
  return key ? fieldDeclaration[key] : defaultGndPrimaryFieldExtract;
};

const defaultPrimaryFields: PrimaryFieldExtract<any> = {
  label: "preferredName",
};

type GNDSuggestResponse = {
  id: string;
  label: string;
  category: string;
  image?: string;
};

const suggestResponseSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    id: {
      type: "string",
    },
    label: {
      type: "string",
    },
    category: {
      type: "string",
    },
    image: {
      type: "string",
    },
  },
  required: ["id", "label", "category"],
};

export const gndEntryFromSuggestion: (
  allProps: any,
) => null | BasicThingInformation = (allProps: any) => {
  const ajv = new Ajv();
  if (!ajv.validate(suggestResponseSchema, allProps)) {
    console.error("Invalid GND Suggestion Response", allProps);
    return null;
  }
  const { id, label, category, image }: GNDSuggestResponse = allProps;
  const labelParts = label.split(" | ");
  const [primary, ...secondary] = labelParts;

  return {
    id,
    label: primary,
    secondary: secondary.join(" | "),
    category,
    avatar: image,
    allProps,
  };
};
export const gndEntryWithMainInfo: (allProps: any) => BasicThingInformation = (
  allProps: any,
) => {
  const { id, type } = allProps;
  const primaryFieldDeclaration =
    getFirstMatchingFieldDeclaration(type, gndPrimaryFields) ||
    defaultPrimaryFields;
  const { label, description, image } = applyToEachField(
    allProps,
    primaryFieldDeclaration,
    extractFieldIfString,
  );
  return {
    id,
    label,
    secondary: description,
    avatar: image,
    allProps,
  };
};

const LobidSearchTable: FunctionComponent<Props> = ({
  searchString,
  typeIRI,
  onSelect,
  onAcceptItem,
  selectedId: selectedIdProp,
}) => {
  const { t } = useTranslation();
  const [resultTable, setResultTable] = useState<LobIDEntry[] | undefined>();
  const [selectedId, setSelectedId] = useControlled<string | undefined>({
    name: "selectedId",
    controlled: selectedIdProp,
    default: undefined,
  });
  const [selectedEntry, setSelectedEntry] = useState<LobIDEntry | undefined>();

  const fetchData = useCallback(async () => {
    if (!searchString || searchString.length < 1) return;
    setResultTable(
      (
        await findEntityWithinLobid(
          searchString,
          typeIRItoTypeName(typeIRI),
          lobidTypemap,
          10,
        )
      )?.member?.map((allProps: any) => gndEntryWithMainInfo(allProps)),
    );
  }, [searchString, typeIRI]);

  const { data: rawEntry } = useQuery(
    ["lobid", selectedId],
    () => findEntityWithinLobidByIRI(selectedId),
    { enabled: !!selectedId },
  );

  useEffect(() => {
    if (rawEntry) {
      const entry = gndEntryWithMainInfo(rawEntry);
      setSelectedEntry(entry);
    }
  }, [rawEntry, onSelect, setSelectedEntry]);

  const handleSelect = useCallback(
    async (id: string | undefined) => {
      setSelectedId(id);
      onSelect && onSelect(id);
    },
    [setSelectedId, onSelect],
  );

  useEffect(() => {
    fetchData();
  }, [searchString, typeIRI, fetchData]);

  return (
    <>
      <List>
        {// @ts-ignore
        resultTable?.map((data, idx) => {
          const { id, label, avatar, secondary } = data;
          return (
            <ClassicResultListItem
              key={id}
              id={id}
              index={idx}
              onSelected={handleSelect}
              label={label}
              secondary={secondary}
              avatar={avatar}
              altAvatar={String(idx + 1)}
              popperChildren={
                <ClassicEntityCard
                  sx={{
                    maxWidth: "30em",
                    maxHeight: "80vh",
                    overflow: "auto",
                  }}
                  id={id}
                  data={data}
                  onBack={() => handleSelect(undefined)}
                  cardActionChildren={
                    <Button
                      size="small"
                      color="primary"
                      variant="contained"
                      className="accept-button"
                      disabled={!onAcceptItem || !selectedEntry}
                      onClick={() =>
                        onAcceptItem && onAcceptItem(id, selectedEntry)
                      }
                    >
                      {t("accept entity")}
                    </Button>
                  }
                  detailView={
                    <>
                      <LobidAllPropTable
                        allProps={data.allProps}
                        onEntityChange={handleSelect}
                      />
                      {(data.allProps?.sameAs || [])
                        .filter(({ id }) =>
                          id.startsWith("http://www.wikidata.org/entity/"),
                        )
                        .map(({ id }) => (
                          <WikidataAllPropTable key={id} thingIRI={id} />
                        ))}
                    </>
                  }
                />
              }
            />
          );
        })}
      </List>
    </>
  );
};

export default LobidSearchTable;
