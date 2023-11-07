import { List } from "@mui/material";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  findEntityWithinLobid,
  findEntityWithinLobidByIRI,
} from "../../utils/lobid/findEntityWithinLobid";
import ClassicResultListItem from "../result/ClassicResultListItem";
import ClassicEntityCard from "./ClassicEntityCard";
import LobidAllPropTable from "./LobidAllPropTable";
import WikidataAllPropTable from "../wikidata/WikidataAllPropTable";
import {
  PrimaryFieldExtract,
  PrimaryFieldExtractDeclaration,
} from "../../utils/types";
import { filterUndefOrNull } from "../../utils/core";
import {
  applyToEachField,
  extractFieldIfString,
} from "../../utils/mapping/simpleFieldExtractor";
import { useQuery } from "@tanstack/react-query";

type Props = {
  searchString: string;
  typeName?: string;
  onSelect?: (id: string | undefined) => void;
  onAcceptItem?: (id: string | undefined, data: any) => void;
};

type LobIDEntry = {
  id: string;
  [key: string]: any;
};

const nullOnEmpty = (arr: any[]) => (arr.length > 0 ? arr : null);

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
  return key ? fieldDeclaration[key] : null;
};

const defaultPrimaryFields: PrimaryFieldExtract<any> = {
  label: "preferredName",
};

const gndEntryWithMainInfo = (allProps: any) => {
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
  typeName = "Person",
  onSelect,
  onAcceptItem,
}) => {
  const [resultTable, setResultTable] = useState<LobIDEntry[] | undefined>();
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [selectedEntry, setSelectedEntry] = useState<LobIDEntry | undefined>();

  const fetchData = useCallback(async () => {
    if (!searchString || searchString.length < 1) return;
    setResultTable(
      (await findEntityWithinLobid(searchString, typeName, 10))?.member?.map(
        (allProps: any) => gndEntryWithMainInfo(allProps),
      ),
    );
  }, [searchString, typeName]);

  const { data: rawEntry } = useQuery(
    ["lobid", selectedId],
    () => findEntityWithinLobidByIRI(selectedId),
    { enabled: !!selectedId },
  );

  useEffect(() => {
    if (rawEntry) {
      const entry = gndEntryWithMainInfo(rawEntry);
      setSelectedEntry(entry);
      onSelect && onSelect(entry.id);
    }
  }, [rawEntry, onSelect, setSelectedEntry]);

  const handleSelect = useCallback(
    async (id: string | undefined) => {
      setSelectedId(id);
    },
    [setSelectedId],
  );

  useEffect(() => {
    fetchData();
  }, [searchString, typeName, fetchData]);

  return (
    <>
      {selectedId && selectedEntry ? (
        <ClassicEntityCard
          id={selectedId}
          data={selectedEntry}
          onBack={() => handleSelect(undefined)}
          onSelectItem={handleSelect}
          onAcceptItem={(id) => onAcceptItem && onAcceptItem(id, selectedEntry)}
          acceptTitle={"Eintrag übernehmen"}
          detailView={
            <>
              <LobidAllPropTable
                allProps={selectedEntry.allProps}
                onEntityChange={handleSelect}
              />
              {(selectedEntry.allProps?.sameAs || [])
                .filter(({ id }) =>
                  id.startsWith("http://www.wikidata.org/entity/"),
                )
                .map(({ id }) => (
                  <WikidataAllPropTable key={id} thingIRI={id} />
                ))}
            </>
          }
        />
      ) : (
        <List>
          {// @ts-ignore
          resultTable?.map(
            (
              {
                id,
                label,
                dateOfBirthAndDeath,
                dateOfBirth,
                dateOfDeath,
                avatar,
                secondary,
              },
              idx,
            ) => {
              return (
                <ClassicResultListItem
                  key={id}
                  id={id}
                  onSelected={handleSelect}
                  label={label}
                  secondary={secondary}
                  avatar={avatar}
                  altAvatar={String(idx + 1)}
                />
              );
            },
          )}
        </List>
      )}
    </>
  );
};

export default LobidSearchTable;
