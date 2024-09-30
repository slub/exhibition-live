import { Button, List } from "@mui/material";
import { dcterms } from "@tpluscode/rdf-ns-builders";
import { FunctionComponent, useCallback, useEffect, useState } from "react";

import { useLocalHistory, useSettings } from "@slub/edb-state-hooks";
import { findFirstInProps, RootNode } from "@slub/edb-graph-traversal";
import { useTranslation } from "next-i18next";
import { findEntityWithinK10Plus } from "@slub/edb-kxp-utils";
import { fabio } from "@slub/edb-marc-to-rdf";
import {
  ClassicEntityCard,
  ClassicResultListItem,
} from "@slub/edb-basic-components";
import { KXPAllPropTable } from "./KXPAllPropTable";

type Props = {
  searchString: string;
  typeName?: string;
  onSelect?: (id: string | undefined) => void;
  onAcceptItem?: (id: string | undefined, data: any) => void;
};

export const K10PlusSearchTable: FunctionComponent<Props> = ({
  searchString,
  typeName = "Person",
  onSelect,
  onAcceptItem,
}) => {
  const { t } = useTranslation();
  const [resultTable, setResultTable] = useState<RootNode[] | undefined>();
  const { history, pushHistory, popHistory } = useLocalHistory();
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [selectedEntry, setSelectedEntry] = useState<RootNode | undefined>();
  const { externalAuthority } = useSettings();
  const k10PlusEndpointURL =
      externalAuthority.kxp?.endpoint || "https://sru.bsz-bw.de/swbtest",
    k10PlusBaseURL = externalAuthority.kxp?.baseURL || "https://kxp.k10plus.de",
    k10PlusDetailURL = `${k10PlusBaseURL}/DB=2.1/PPNSET?PPN=`;

  const fetchData = useCallback(async () => {
    if (!searchString || searchString.length < 1) return;

    const mappedFields = await findEntityWithinK10Plus(
      searchString,
      typeName,
      k10PlusEndpointURL,
      10,
      externalAuthority.kxp?.recordSchema,
    );
    if (!mappedFields) return;
    setResultTable(mappedFields);
  }, [
    searchString,
    typeName,
    k10PlusEndpointURL,
    externalAuthority.kxp?.recordSchema,
    setResultTable,
  ]);

  const handleSelect = useCallback(
    async (id: string | undefined, push: boolean = true) => {
      setSelectedId(id);
      push && pushHistory(id);
      const cachedEntry =
        id && resultTable?.find((entry) => String(entry.id) === id);
      if (!cachedEntry) {
        setSelectedEntry(undefined);
        onSelect && onSelect(undefined);
        return;
      }
      setSelectedEntry(cachedEntry);
      onSelect && onSelect(id);
    },
    [setSelectedId, resultTable, setSelectedEntry, onSelect, pushHistory],
  );

  useEffect(() => {
    fetchData();
  }, [searchString, typeName, fetchData]);

  const handleAccept = useCallback(
    (id: string | undefined) => {
      onAcceptItem && onAcceptItem(id, selectedEntry);
    },
    [onAcceptItem, selectedEntry],
  );

  return (
    <>
      {selectedEntry && (
        <>
          <ClassicEntityCard
            data={{
              id: selectedId,
              label:
                selectedEntry.properties[dcterms.title.value]?.[0]?.value ||
                String(selectedEntry.id),
              description: findFirstInProps(
                selectedEntry.properties,
                fabio.hasSubtitle,
                dcterms.description,
                dcterms.abstract,
              ),
            }}
            onBack={() => handleSelect(popHistory(), false)}
            cardActionChildren={
              <Button
                size="small"
                color="primary"
                variant="contained"
                onClick={() => handleAccept(selectedId)}
              >
                {t("accept entity")}
              </Button>
            }
            id={selectedId}
            detailView={<KXPAllPropTable entry={selectedEntry} />}
          />
        </>
      )}
      <List>
        {resultTable?.map((entry, idx) => (
          <ClassicResultListItem
            key={entry.id}
            id={String(entry.id)}
            index={idx}
            onSelected={(id) => handleSelect(id)}
            label={
              entry.properties[dcterms.title.value]?.[0]?.value ||
              String(entry.id)
            }
            secondary={findFirstInProps(
              entry.properties,
              fabio.hasSubtitle,
              dcterms.description,
              dcterms.abstract,
            )}
            altAvatar={String(idx + 1)}
          />
        ))}
      </List>
    </>
  );
};
