import datasetFactory from "@rdfjs/dataset";
import clownface from "clownface";
import {
  NodePropertyTree,
  nodeToPropertyTree,
  RootNode,
} from "@slub/edb-graph-traversal";
import { kxp, mapDatafieldToQuads, RecordElement } from "@slub/edb-marc-to-rdf";

export const marcRecord2RootNode: (record: RecordElement) => RootNode = (
  record,
) => {
  //const mappedControlfields = record.recordData.record.controlfield.map(ds => mapControlfield(ds))
  const id = record.recordData.record.controlfield.filter(
    (cf) => cf["@_tag"] === "001",
  )[0]["#text"];
  const subjectNode = kxp("record/" + String(id));
  const extractedKnowledge = record.recordData.record.datafield.flatMap((ds) =>
    mapDatafieldToQuads(subjectNode, ds),
  );
  const dataset = datasetFactory.dataset(extractedKnowledge);
  const tbbt = clownface({ dataset });
  const properties = nodeToPropertyTree(subjectNode, tbbt) as NodePropertyTree;
  return {
    id,
    properties,
  };
};
