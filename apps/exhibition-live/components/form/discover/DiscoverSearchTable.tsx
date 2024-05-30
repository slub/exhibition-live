import { List } from "@mui/material";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAdbContext, useGlobalCRUDOptions } from "@slub/edb-state-hooks";
import { findEntityByClass } from "@slub/sparql-schema";
import { ClassicResultListItem } from "@slub/edb-basic-components";
import { EntityDetailElement } from "@slub/edb-advanced-components";

type Props = {
  searchString: string;
  typeName?: string;
  classIRI?: string;
  onAcceptItem?: (id: string | undefined, data: any) => void;
  selectedIndex?: number;
};

const DiscoverSearchTable: FunctionComponent<Props> = ({
  searchString,
  typeName = "Person",
  onAcceptItem,
  selectedIndex,
}) => {
  const [resultTable, setResultTable] = useState<any | undefined>();
  const {
    typeNameToTypeIRI,
    jsonLDConfig: { defaultPrefix },
    queryBuildOptions,
  } = useAdbContext();
  const { crudOptions } = useGlobalCRUDOptions();
  const typeIRI = useMemo(
    () => typeNameToTypeIRI[typeName],
    [typeName, typeNameToTypeIRI],
  );

  const fetchData = useCallback(async () => {
    if (!searchString || searchString.length < 1 || !crudOptions) return;
    setResultTable(
      (
        await findEntityByClass(
          searchString,
          typeIRI,
          crudOptions.selectFetch,
          { defaultPrefix, queryBuildOptions },
        )
      ).map(({ name = "", value }: { name: string; value: any }) => {
        return {
          label: name,
          id: value as string,
        };
      }),
    );
  }, [searchString, typeIRI, crudOptions, defaultPrefix, queryBuildOptions]);

  const handleSelect = useCallback(
    (id: string | undefined) => {
      const data = id && resultTable?.find((entry) => entry.id === id);
      onAcceptItem && data && onAcceptItem(id, data);
    },
    [resultTable, onAcceptItem],
  );

  useEffect(() => {
    fetchData();
  }, [searchString, typeName, fetchData]);

  return (
    <List>
      {// @ts-ignore
      resultTable?.map(({ id, label, avatar, secondary }, idx) => {
        return (
          <ClassicResultListItem
            key={id}
            id={id}
            index={idx}
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
                cardActionChildren={null}
                readonly
              />
            }
          />
        );
      })}
    </List>
  );
};

export default DiscoverSearchTable;
