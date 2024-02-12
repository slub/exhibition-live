import { List, ListItemProps } from "@mui/material";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";

import { useGlobalCRUDOptions } from "../../state/useGlobalCRUDOptions";
import { findEntityByClass } from "../../utils/discover";
import { sladb } from "../formConfigs";
import ClassicEntityCard from "../lobid/ClassicEntityCard";
import LobidAllPropTable from "../lobid/LobidAllPropTable";
import ClassicResultListItem from "../result/ClassicResultListItem";
import { EntityDetailElement } from "../show";

type Props = {
  searchString: string;
  typeName?: string;
  classIRI?: string;
  onSelect?: (id: string | undefined) => void;
  onAcceptItem?: (id: string | undefined, data: any) => void;
  selectedIndex?: number;
};

const DiscoverSearchTable: FunctionComponent<Props> = ({
  searchString,
  typeName = "Person",
  classIRI = sladb[typeName].value,
  onSelect,
  onAcceptItem,
  selectedIndex,
}) => {
  const [resultTable, setResultTable] = useState<any | undefined>();
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [selectedEntry, setSelectedEntry] = useState<any | undefined>();
  const { crudOptions } = useGlobalCRUDOptions();
  const typeIRI = sladb[typeName].value;

  const fetchData = useCallback(async () => {
    if (!searchString || searchString.length < 1 || !crudOptions) return;
    setResultTable(
      (
        await findEntityByClass(searchString, classIRI, crudOptions.selectFetch)
      ).map(({ name = "", value }: { name: string; value: any }) => {
        return {
          label: name,
          id: value as string,
        };
      }),
    );
  }, [searchString, classIRI, crudOptions]);

  const handleSelect = useCallback(
    (id: string | undefined) => {
      setSelectedId(id);
      // @ts-ignore
      setSelectedEntry(id && resultTable?.find((entry) => entry.id === id));
      onSelect && onSelect(id);
    },
    [setSelectedId, resultTable, setSelectedEntry, onSelect],
  );

  useEffect(() => {
    fetchData();
  }, [searchString, typeName, fetchData]);

  return (
    <>
      {selectedEntry ? (
        <ClassicEntityCard
          id={selectedId}
          data={selectedEntry}
          onBack={() => handleSelect(undefined)}
          onSelectItem={handleSelect}
          onAcceptItem={onAcceptItem}
          acceptTitle={"Eintrag bearbeiten"}
          detailView={
            <LobidAllPropTable
              allProps={selectedEntry.allProps}
              onEntityChange={handleSelect}
            />
          }
        />
      ) : (
        <List>
          {// @ts-ignore
          resultTable?.map(({ id, label, avatar, secondary }, idx) => {
            return (
              <ClassicResultListItem
                key={id}
                id={id}
                onSelected={handleSelect}
                label={label}
                secondary={secondary}
                avatar={avatar}
                altAvatar={idx + 1}
                selected={selectedIndex === idx}
                popperChildren={
                  <EntityDetailElement
                    sx={{
                      maxWidth: "30em",
                      maxHeight: "80vh",
                      overflow: "auto",
                    }}
                    entityIRI={id}
                    typeIRI={typeIRI}
                    data={undefined}
                  />
                }
              />
            );
          })}
        </List>
      )}
    </>
  );
};

export default DiscoverSearchTable;
