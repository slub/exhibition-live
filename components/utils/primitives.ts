import {rdf, xsd} from "@tpluscode/rdf-ns-builders";
import * as RDF from "rdf-js";

export function rdfLiteralToNative(literal: RDF.Literal): string | number | boolean | Date {
    switch (literal.datatype.value) {
        case rdf.langString.value:
        case xsd.string.value:
            return literal.value
        case xsd.boolean.value:
            return literal.value === "true"
        case xsd.integer.value:
            return parseInt(literal.value)
        case xsd.decimal.value:
            return parseFloat(literal.value)
        case xsd.double.value:
            return parseFloat(literal.value)
        case xsd.date.value:
            return new Date(literal.value)
        case xsd.dateTime.value:
            return new Date(literal.value)
        default:
            throw new Error(`Unsupported literal type ${literal.datatype.value}`)
    }
}
