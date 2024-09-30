import { RootNode } from "@slub/edb-graph-traversal";
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@mui/material";
import { LabledLink } from "./LabledLink";
import { LabeledBNode } from "./LabeledBNode";
import { BlankNode } from "@rdfjs/types";

export const KXPAllPropTable = ({ entry }: { entry: RootNode }) => {
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
