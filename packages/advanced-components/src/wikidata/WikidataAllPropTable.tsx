import {
  Container,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@mui/material";
import React, { FunctionComponent, useEffect, useState } from "react";

import {
  CommonPropertyValues,
  getCommonPropsFromWikidata,
} from "@slub/edb-ui-utils";
import { OverflowContainer } from "@slub/edb-basic-components";

interface OwnProps {
  thingIRI?: string;
}

export type WikidataAllPropTableProps = OwnProps;

export const WikidataAllPropTable: FunctionComponent<
  WikidataAllPropTableProps
> = ({ thingIRI }) => {
  const [allProps, setAllProps] = useState<CommonPropertyValues>({});
  useEffect(() => {
    if (!thingIRI) return;
    getCommonPropsFromWikidata(
      thingIRI,
      ["https://query.wikidata.org/sparql"],
      true,
    ).then((_allProps) => {
      setAllProps(_allProps as CommonPropertyValues);
    });
  }, [thingIRI, setAllProps]);

  return (
    <TableContainer component={Container}>
      {typeof allProps === "object" ? (
        <Table
          sx={{ minWidth: "100%", tableLayout: "fixed" }}
          aria-label="custom table"
        >
          <TableBody>
            {Object.entries(allProps).map(([key, value]) => (
              <TableRow key={key}>
                <TableCell
                  style={{
                    width: "20%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  component="th"
                  scope="row"
                >
                  <OverflowContainer>{value.label}</OverflowContainer>
                </TableCell>
                <TableCell align="right">
                  {value.objects.map((v) => {
                    if (v.termType !== "Literal" && v?.uri) {
                      return (
                        <span key={v.uri}>
                          <a
                            href={v.uri}
                            target="_blank"
                            referrerPolicy="no-referrer"
                            rel="noreferrer"
                          >
                            {v.label}
                          </a>
                          ,{" "}
                        </span>
                      );
                    }
                    if (v.termType === "Literal") {
                      return <span key={v.value}>{v.value}, </span>;
                    }
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Skeleton width={"100%"} height={"200px"} />
      )}
    </TableContainer>
  );
};
