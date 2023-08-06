// To parse this data:
//
//   import { Convert, SearchRetrieveResponseTypes } from "./file";
//
//   const searchRetrieveResponseTypes = Convert.toSearchRetrieveResponseTypes(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface SearchRetrieveResponseTypes {
    '?xml':                 XML;
    searchRetrieveResponse: SearchRetrieveResponse;
}

export interface XML {
    '@_version':  string;
    '@_encoding': string;
}

export interface SearchRetrieveResponse {
    version:                     number;
    numberOfRecords:             number;
    records:                     Records;
    echoedSearchRetrieveRequest: EchoedSearchRetrieveRequest;
}

export interface EchoedSearchRetrieveRequest {
    version:        number;
    query:          string;
    maximumRecords: number;
    recordPacking:  RecordPacking;
    recordSchema:   RecordSchema;
}

export enum RecordPacking {
    XML = 'xml',
}

export enum RecordSchema {
    Marcxmlk10OS = 'marcxmlk10os',
}

export interface Records {
    record: RecordElement[];
}

export interface RecordElement {
    recordSchema:   RecordSchema;
    recordPacking:  RecordPacking;
    recordData:     RecordData;
    recordPosition: number;
}

export interface RecordData {
    record: RecordDataRecord;
}

export interface RecordDataRecord {
    leader:       Leader;
    controlfield: Controlfield[];
    datafield:    Datafield[];
}

export interface Controlfield {
    '#text': TextEnum | number;
    '@_tag': string;
}

export enum TextEnum {
    De627 = 'DE-627',
    The120120S9999Xx00GerC = '120120s9999    xx |||||      00| ||ger c',
    The230629S2023Xx00GerC = '230629s2023    xx |||||      00| ||ger c',
    The230717S2023Xx00GerC = '230717s2023    xx |||||      00| ||ger c',
    Tu = 'tu',
}

export interface Datafield {
    subfield: SubfieldElement[] | SubfieldElement;
    '@_tag':  string;
    '@_ind1': string;
    '@_ind2': string;
}

export interface SubfieldElement {
    '#text':  number | string;
    '@_code': string;
}

export enum Leader {
    CaaA2224500 = 'caa a22     2  4500',
    CamA2224500 = 'cam a22     2  4500',
    NaaA2224500 = 'naa a22     2  4500',
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toSearchRetrieveResponseTypes(json: string): SearchRetrieveResponseTypes {
        return cast(JSON.parse(json), r('SearchRetrieveResponseTypes'))
    }

    public static searchRetrieveResponseTypesToJson(value: SearchRetrieveResponseTypes): string {
        return JSON.stringify(uncast(value, r('SearchRetrieveResponseTypes')), null, 2)
    }
}

function invalidValue(typ: any, val: any, key: any, parent: any = ''): never {
    const prettyTyp = prettyTypeName(typ)
    const parentText = parent ? ` on ${parent}` : ''
    const keyText = key ? ` for key "${key}"` : ''
    throw Error(`Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(val)}`)
}

function prettyTypeName(typ: any): string {
    if (Array.isArray(typ)) {
        if (typ.length === 2 && typ[0] === undefined) {
            return `an optional ${prettyTypeName(typ[1])}`
        } else {
            return `one of [${typ.map(a => { return prettyTypeName(a) }).join(', ')}]`
        }
    } else if (typeof typ === 'object' && typ.literal !== undefined) {
        return typ.literal
    } else {
        return typeof typ
    }
}

function jsonToJSProps(typ: any): any {
    if (typ.jsonToJS === undefined) {
        const map: any = {}
        typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ })
        typ.jsonToJS = map
    }
    return typ.jsonToJS
}

function jsToJSONProps(typ: any): any {
    if (typ.jsToJSON === undefined) {
        const map: any = {}
        typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ })
        typ.jsToJSON = map
    }
    return typ.jsToJSON
}

function transform(val: any, typ: any, getProps: any, key: any = '', parent: any = ''): any {
    function transformPrimitive(typ: string, val: any): any {
        if (typeof typ === typeof val) return val
        return invalidValue(typ, val, key, parent)
    }

    function transformUnion(typs: any[], val: any): any {
        // val must validate against one typ in typs
        const l = typs.length
        for (let i = 0; i < l; i++) {
            const typ = typs[i]
            try {
                return transform(val, typ, getProps)
            } catch (_) {}
        }
        return invalidValue(typs, val, key, parent)
    }

    function transformEnum(cases: string[], val: any): any {
        if (cases.indexOf(val) !== -1) return val
        return invalidValue(cases.map(a => { return l(a) }), val, key, parent)
    }

    function transformArray(typ: any, val: any): any {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue(l('array'), val, key, parent)
        return val.map(el => transform(el, typ, getProps))
    }

    function transformDate(val: any): any {
        if (val === null) {
            return null
        }
        const d = new Date(val)
        if (isNaN(d.valueOf())) {
            return invalidValue(l('Date'), val, key, parent)
        }
        return d
    }

    function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
        if (val === null || typeof val !== 'object' || Array.isArray(val)) {
            return invalidValue(l(ref || 'object'), val, key, parent)
        }
        const result: any = {}
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key]
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined
            result[prop.key] = transform(v, prop.typ, getProps, key, ref)
        })
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key, ref)
            }
        })
        return result
    }

    if (typ === 'any') return val
    if (typ === null) {
        if (val === null) return val
        return invalidValue(typ, val, key, parent)
    }
    if (typ === false) return invalidValue(typ, val, key, parent)
    let ref: any = undefined
    while (typeof typ === 'object' && typ.ref !== undefined) {
        ref = typ.ref
        typ = typeMap[typ.ref]
    }
    if (Array.isArray(typ)) return transformEnum(typ, val)
    if (typeof typ === 'object') {
        return typ.hasOwnProperty('unionMembers') ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty('arrayItems')    ? transformArray(typ.arrayItems, val)
            : typ.hasOwnProperty('props')         ? transformObject(getProps(typ), typ.additional, val)
            : invalidValue(typ, val, key, parent)
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== 'number') return transformDate(val)
    return transformPrimitive(typ, val)
}

function cast<T>(val: any, typ: any): T {
    return transform(val, typ, jsonToJSProps)
}

function uncast<T>(val: T, typ: any): any {
    return transform(val, typ, jsToJSONProps)
}

function l(typ: any) {
    return { literal: typ }
}

function a(typ: any) {
    return { arrayItems: typ }
}

function u(...typs: any[]) {
    return { unionMembers: typs }
}

function o(props: any[], additional: any) {
    return { props, additional }
}

function m(additional: any) {
    return { props: [], additional }
}

function r(name: string) {
    return { ref: name }
}

const typeMap: any = {
    'SearchRetrieveResponseTypes': o([
        { json: '?xml', js: '?xml', typ: r('XML') },
        { json: 'searchRetrieveResponse', js: 'searchRetrieveResponse', typ: r('SearchRetrieveResponse') },
    ], false),
    'XML': o([
        { json: '@_version', js: '@_version', typ: '' },
        { json: '@_encoding', js: '@_encoding', typ: '' },
    ], false),
    'SearchRetrieveResponse': o([
        { json: 'version', js: 'version', typ: 3.14 },
        { json: 'numberOfRecords', js: 'numberOfRecords', typ: 0 },
        { json: 'records', js: 'records', typ: r('Records') },
        { json: 'echoedSearchRetrieveRequest', js: 'echoedSearchRetrieveRequest', typ: r('EchoedSearchRetrieveRequest') },
    ], false),
    'EchoedSearchRetrieveRequest': o([
        { json: 'version', js: 'version', typ: 3.14 },
        { json: 'query', js: 'query', typ: '' },
        { json: 'maximumRecords', js: 'maximumRecords', typ: 0 },
        { json: 'recordPacking', js: 'recordPacking', typ: r('RecordPacking') },
        { json: 'recordSchema', js: 'recordSchema', typ: r('RecordSchema') },
    ], false),
    'Records': o([
        { json: 'record', js: 'record', typ: a(r('RecordElement')) },
    ], false),
    'RecordElement': o([
        { json: 'recordSchema', js: 'recordSchema', typ: r('RecordSchema') },
        { json: 'recordPacking', js: 'recordPacking', typ: r('RecordPacking') },
        { json: 'recordData', js: 'recordData', typ: r('RecordData') },
        { json: 'recordPosition', js: 'recordPosition', typ: 0 },
    ], false),
    'RecordData': o([
        { json: 'record', js: 'record', typ: r('RecordDataRecord') },
    ], false),
    'RecordDataRecord': o([
        { json: 'leader', js: 'leader', typ: r('Leader') },
        { json: 'controlfield', js: 'controlfield', typ: a(r('Controlfield')) },
        { json: 'datafield', js: 'datafield', typ: a(r('Datafield')) },
    ], false),
    'Controlfield': o([
        { json: '#text', js: '#text', typ: u(r('TextEnum'), 0) },
        { json: '@_tag', js: '@_tag', typ: '' },
    ], false),
    'Datafield': o([
        { json: 'subfield', js: 'subfield', typ: u(a(r('SubfieldElement')), r('SubfieldElement')) },
        { json: '@_tag', js: '@_tag', typ: '' },
        { json: '@_ind1', js: '@_ind1', typ: '' },
        { json: '@_ind2', js: '@_ind2', typ: '' },
    ], false),
    'SubfieldElement': o([
        { json: '#text', js: '#text', typ: u(0, '') },
        { json: '@_code', js: '@_code', typ: '' },
    ], false),
    'RecordPacking': [
        'xml',
    ],
    'RecordSchema': [
        'marcxmlk10os',
    ],
    'TextEnum': [
        'DE-627',
        '120120s9999    xx |||||      00| ||ger c',
        '230629s2023    xx |||||      00| ||ger c',
        '230717s2023    xx |||||      00| ||ger c',
        'tu',
    ],
    'Leader': [
        'caa a22     2  4500',
        'cam a22     2  4500',
        'naa a22     2  4500',
    ],
}
