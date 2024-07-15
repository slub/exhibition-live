import { parse } from "csv-parse";
import fs from "fs";
import * as path from "path";
import { filterUndefOrNull, makeColumnDesc } from "@slub/edb-core-utils";
import { matchBasedSpreadsheetMappings_NewYork } from "./mapping";
import {
  DeclarativeFlatMappings,
  mapByConfigFlat,
  matchBased2DeclarativeFlatMapping,
} from "@slub/edb-data-mapping";
import { typeNameToTypeIRI } from "./dataStore";
import { createNewIRI, strategyContext } from "./flatImport";

export const parseCSV = async (
  file: string,
  typeName: string,
  amount: number,
) => {
  const classIRI = typeNameToTypeIRI(typeName);
  const parser = fs.createReadStream(path.resolve(file)).pipe(parse({}));
  let recordCount = 0;
  let m: DeclarativeFlatMappings | null = null;
  for await (const record of parser) {
    if (recordCount === 0) {
      const columnDesc = makeColumnDesc(record as string[]);
      m = filterUndefOrNull(
        matchBasedSpreadsheetMappings_NewYork.map((mapping) => {
          let res = null;
          try {
            res = matchBased2DeclarativeFlatMapping(columnDesc, mapping);
          } catch (e) {}
          return res;
        }),
      );
    } else {
      if (m) {
        try {
          const mappedData = await mapByConfigFlat(
            (colIndex) => record[colIndex],
            {
              "@type": classIRI,
              "@id": createNewIRI(),
            },
            m,
            strategyContext,
          );
          console.log(JSON.stringify(mappedData, null, 2));
        } catch (e) {
          console.error(e);
        }
      }
    }
    if (amount && recordCount >= amount) {
      break;
    }
    // Work with each record
    //records.push(record);
    recordCount++;
  }
};
