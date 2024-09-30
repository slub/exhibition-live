import { ProcessFlatResourceFn } from "@slub/edb-data-mapping";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse";

/**
 *  returns a function to process a specific CSV file using the ProcessFlatResourceFn interface
 *  using the csv-parse library
 *
 * @param file the path to the CSV file
 */
export const processCSV: (file: string) => ProcessFlatResourceFn = (file) => {
  const processCSVResource: ProcessFlatResourceFn = async (
    headerCallback: (header: string[]) => Promise<void>,
    recordCallback: (record: string[], index: number) => Promise<void>,
    amount?: number,
    offset?: number,
  ) => {
    const parser = fs.createReadStream(path.resolve(file)).pipe(parse({}));
    let index = 0,
      recordCount = 0;
    for await (const record of parser) {
      if (index === 0) {
        await headerCallback(record as string[]);
      } else {
        if (offset && index < offset) {
          index++;
          continue;
        }
        await recordCallback(record as string[], index);
        recordCount++;
      }
      if (amount && recordCount >= amount) {
        break;
      }
      index++;
    }
  };
  return processCSVResource;
};
