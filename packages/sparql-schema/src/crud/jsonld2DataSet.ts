import datasetFactory from "@rdfjs/dataset";
import {DatasetCore, Quad, Stream} from "@rdfjs/types";
import jsonld from "jsonld";
import Parser from "@rdfjs/parser-jsonld";
import dsExt from "rdf-dataset-ext";

export const jsonld2DataSet: (jsonld: any) => Promise<DatasetCore<Quad>> = async (
    input: any
) => {
    let ds = datasetFactory.dataset();
    try {
        ds = await jsonld.toRDF(input) as DatasetCore<Quad>;
    } catch (e) {
        throw new Error("unable to parse the data", { cause: e});
    }
    return ds;
}

export const jsonldStream2DataSet: (jsonld: any) => Promise<DatasetCore<Quad>> = async (
    input: Stream<any>
) => {
    let ds = datasetFactory.dataset();
    try {
        const parser = new Parser();
        ds = await dsExt.fromStream(
            datasetFactory.dataset(),
            parser.import(input)
        );
    } catch (e) {
        throw new Error("unable to parse the data", { cause: e});
    }
    return ds;
}
