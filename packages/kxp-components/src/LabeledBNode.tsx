import { BlankNode } from "@rdfjs/types";
import { findFirstInProps, NodePropertyTree } from "@slub/edb-graph-traversal";
import { useMemo } from "react";
import { dcterms, foaf, rdfs, skos } from "@tpluscode/rdf-ns-builders";
import { geonames, radatana } from "@slub/edb-marc-to-rdf";
import {
  Button,
  styled,
  Tooltip,
  tooltipClasses,
  TooltipProps,
} from "@mui/material";

import { KXPAllPropTable } from "./KXPAllPropTable";

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
export const LabeledBNode = ({
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
