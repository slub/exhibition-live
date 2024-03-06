import { List, useControlled } from "@mui/material";
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
import { EntityDetailElement } from "../show";
import { sladb } from "../formConfigs";
import {typeIRItoTypeName} from "../../config";

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

export const gndEntryWithMainInfo = (allProps: any) => {
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
      (await findEntityWithinLobid(searchString, typeIRItoTypeName(typeIRI), 10))?.member?.map(
        (allProps: any) => gndEntryWithMainInfo(allProps),
      ),
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
            const { id, label, avatar, secondary } = data
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
                    onSelectItem={handleSelect}
                    onAcceptItem={(id) => onAcceptItem && onAcceptItem(id, selectedEntry)}
                    acceptTitle={"Eintrag übernehmen"}
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
