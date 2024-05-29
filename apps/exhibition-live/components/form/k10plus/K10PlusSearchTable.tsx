import {
  Button,
  Container,
  Link,
  List,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tooltip,
  tooltipClasses,
  TooltipProps,
} from "@mui/material";
import { BlankNode } from "@rdfjs/types";
import { dcterms, foaf, rdfs, skos } from "@tpluscode/rdf-ns-builders";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useLocalHistory } from "@slub/edb-state-hooks";
import { useSettings } from "@slub/edb-state-hooks";
import { findFirstInProps, NodePropertyTree } from "@slub/edb-graph-traversal";
import { useTranslation } from "next-i18next";
import { findEntityWithinK10Plus, KXPEntry } from "@slub/edb-kxp-utils";
import { fabio, geonames, radatana } from "@slub/edb-marc-to-rdf";
import {
  ClassicEntityCard,
  ClassicResultListItem,
} from "@slub/edb-basic-components";

type Props = {
  searchString: string;
  typeName?: string;
  onSelect?: (id: string | undefined) => void;
  onAcceptItem?: (id: string | undefined, data: any) => void;
};

const K10PlusSearchTable: FunctionComponent<Props> = ({
  searchString,
  typeName = "Person",
  onSelect,
  onAcceptItem,
}) => {
  const { t } = useTranslation();
  const [resultTable, setResultTable] = useState<KXPEntry[] | undefined>();
  const { history, pushHistory, popHistory } = useLocalHistory();
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [selectedEntry, setSelectedEntry] = useState<KXPEntry | undefined>();
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

const LabledLink = ({
  uri,
  label,
  onClick,
}: {
  uri: string;
  label?: string;
  onClick?: () => void;
}) => {
  const urlSuffix = useMemo(
    () =>
      uri.substring(
        (uri.includes("#") ? uri.lastIndexOf("#") : uri.lastIndexOf("/")) + 1 ??
          0,
        uri.length,
      ),
    [uri],
  );
  return (
    <Link target="_blank" href={uri}>
      {label || urlSuffix}
    </Link>
  );
};
const LightTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.white,
    color: "rgba(0, 0, 0, 0.87)",
    boxShadow: theme.shadows[1],
    fontSize: 11,
  },
}));
const LabeledBNode = ({
  bnode,
  properties,
}: {
  bnode: BlankNode;
  properties: NodePropertyTree;
}) => {
  const label = useMemo(
    () =>
      findFirstInProps(
        properties,
        foaf.name,
        dcterms.title,
        skos.prefLabel,
        rdfs.label,
        radatana.catalogueName,
        geonames("name"),
      ),
    [properties],
  );
  return (
    <LightTooltip
      title={
        <>
          <KXPAllPropTable entry={{ id: bnode.value, properties }} />
        </>
      }
    >
      <Button>{label || bnode.value}</Button>
    </LightTooltip>
  );
};
export const KXPAllPropTable = ({ entry }: { entry: KXPEntry }) => {
  return (
    <TableContainer component={Container}>
      <Table sx={{ minWidth: "100%" }} aria-label="custom table">
        <TableBody>
          {Object.entries(entry.properties).map(([key, value]) => {
            return (
              <TableRow key={key}>
                <TableCell style={{ width: 100 }} component="th" scope="row">
                  <LabledLink uri={key} />
                </TableCell>
                <TableCell align="right">
                  {(Array.isArray(value) &&
                    value.map((v, index) => {
                      const comma = index < value.length - 1 ? "," : "";
                      if (v.termType === "Literal") {
                        return (
                          <span key={v.value}>
                            {v.value}
                            {comma}{" "}
                          </span>
                        );
                      }
                      if (v.termType === "NamedNode") {
                        return (
                          <span key={v.value}>
                            <LabledLink uri={v.value} />
                            {comma}
                          </span>
                        );
                      }
                      if (v.termType === "BlankNode") {
                        return (
                          <span key={v.value}>
                            <LabeledBNode
                              bnode={v.term as BlankNode}
                              properties={v.properties}
                            />
                            {comma}
                          </span>
                        );
                      }
                    })) ||
                    typeof value === "string" ||
                    typeof value === "number" ||
                    (typeof value === "boolean" && value)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
