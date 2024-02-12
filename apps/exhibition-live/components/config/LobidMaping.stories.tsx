import { makeDefaultMappingStrategyContext } from "../form/SimilarityFinder";
import LobidSearchTable, {
  gndEntryWithMainInfo,
} from "../form/lobid/LobidSearchTable";
import {
  findEntityWithinLobidByIRI,
  findEntityWithinLobidWithCertainProperty,
} from "../utils/lobid/findEntityWithinLobid";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useMemo, useState } from "react";
import { declarativeMappings } from "./lobidMappings";
import { mapByConfig } from "../utils/mapping/mapByConfig";
import { useGlobalCRUDOptions } from "../state/useGlobalCRUDOptions";
import { JsonView } from "react-json-view-lite";
import { Grid, List, TextField } from "@mui/material";
import ClassicResultListItem from "../form/result/ClassicResultListItem";
import {sladb} from "../form/formConfigs";

export default {
  title: "forms/mapping/LobidMapping",
};

const LobidMappingTester = ({
  gndID,
  typeName,
}: {
  gndID: string;
  typeName: string;
}) => {
  const { data: allProps } = useQuery(["lobid", gndID], () =>
    findEntityWithinLobidByIRI(gndID),
  );
  const { crudOptions } = useGlobalCRUDOptions();
  const [mappedData, setMappedData] = useState({});

  useEffect(() => {
    if (!allProps) return;
    const mappingConfig = declarativeMappings[typeName];
    if (!mappingConfig) {
      console.warn(`no mapping config for ${typeName}`);
      return;
    }
    try {
      mapByConfig(
        allProps,
        {},
        mappingConfig,
        makeDefaultMappingStrategyContext(
          crudOptions?.selectFetch,
          declarativeMappings,
        ),
      ).then((mappedData_) => {
        setMappedData(mappedData_);
      });
    } catch (e) {}
    return;
  }, [allProps, crudOptions?.selectFetch, typeName]);
  return (
    <div>
      <h1>Mapping for {gndID}</h1>
      <Grid container>
        <Grid item>
          <JsonView data={allProps} shouldInitiallyExpand={(lvl) => lvl < 5} />
        </Grid>
        <Grid item>
          <JsonView
            data={declarativeMappings[typeName]}
            shouldInitiallyExpand={(lvl) => lvl < 5}
          />
        </Grid>
        <Grid item>
          <JsonView
            data={mappedData}
            shouldInitiallyExpand={(lvl) => lvl < 5}
          />
        </Grid>
      </Grid>
      <LobidSearchTable
        searchString=""
        typeIRI={sladb[typeName].value}
        selectedId={gndID}
      />
    </div>
  );
};
export const LobidMappingDefault = () => {
  const gndID = "https://d-nb.info/gnd/1256926108";
  const typeName = "Exhibition";
  return <LobidMappingTester gndID={gndID} typeName={typeName} />;
};

export const LobidMappingPerson = () => {
  const gndID = "https://d-nb.info/gnd/141691824";
  const typeName = "Person";
  return <LobidMappingTester gndID={gndID} typeName={typeName} />;
};

export const LobidSearchForProperty = () => {
  const [propertyName, setPropertyName] = useState(
    "hierarchicalSuperiorOfTheConferenceOrEvent",
  );
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const { data: entries } = useQuery(["lobid", propertyName], async () => {
    const res = await findEntityWithinLobidWithCertainProperty(
      propertyName,
      undefined,
      "ConferenceOrEvent",
    );
    return res?.member?.map((allProps: any) => gndEntryWithMainInfo(allProps));
  });

  return (
    <>
      <TextField
        value={propertyName}
        onChange={(e) => setPropertyName(e.target.value)}
      />
      {selectedId && (
        <LobidMappingTester gndID={selectedId} typeName={"Exhibition"} />
      )}
      <List>
        {// @ts-ignore
        entries?.map(({ id, label, avatar, secondary }, idx) => {
          return (
            <ClassicResultListItem
              key={id}
              id={id}
              onSelected={setSelectedId}
              label={label}
              secondary={secondary}
              avatar={avatar}
              altAvatar={String(idx + 1)}
            />
          );
        })}
      </List>
    </>
  );
};
