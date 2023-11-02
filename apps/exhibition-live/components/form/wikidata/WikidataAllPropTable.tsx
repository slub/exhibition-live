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
} from "../../utils/wikidata";

interface OwnProps {
  thingIRI?: string;
}

type Props = OwnProps;

const WikidataAllPropTable: FunctionComponent<Props> = ({ thingIRI }) => {
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
        <Table sx={{ minWidth: "100%" }} aria-label="custom table">
          <TableBody>
            {Object.entries(allProps).map(([key, value]) => (
              <TableRow key={key}>
                <TableCell style={{ width: 100 }} component="th" scope="row">
                  {value.label}
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

export default WikidataAllPropTable;
