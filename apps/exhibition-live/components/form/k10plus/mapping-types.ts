// To parse this data:
//
//   import { Convert, Types } from "./file";
//
//   const types = Convert.toTypes(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface MappingTypes {
    tags: Tags;
}

export interface Tags {
    '100':                                       The100;
    '110':                                       The110;
    '111':                                       The100;
    '240':                                       The240;
    '245':                                       The245;
    '246':                                       The246;
    '250':                                       The250;
    '260':                                       The260;
    '300':                                       The300;
    '440':                                       The440;
    '503':                                       The092;
    '520':                                       The092;
    '521':                                       The092;
    '546':                                       The092;
    '571':                                       The092;
    '572':                                       The092;
    '573':                                       The092;
    '574':                                       The092;
    '590':                                       The092;
    '592':                                       The092;
    '595':                                       The092;
    '599':                                       The092;
    '600':                                       The600;
    '630':                                       The630;
    '650':                                       The630;
    '651':                                       The651;
    '652':                                       The652;
    '653':                                       The630;
    '655':                                       The630;
    '690':                                       The630;
    '691':                                       The630;
    '692':                                       The630;
    '693':                                       The630;
    '694':                                       The630;
    '695':                                       The695;
    '699':                                       The699;
    '700':                                       The700;
    '710':                                       The710;
    '711':                                       The710;
    '740':                                       The740;
    '760':                                       The760;
    '780':                                       The760;
    '785':                                       The760;
    '856':                                       The856;
    '099':                                       The092;
    '090':                                       The090;
    '092':                                       The092;
    '015':                                       The015;
    '019':                                       The019;
    '610|611':                                   The110;
    '^5(?!03|20|21|46|71|72|73|74|90|92|95|99)': The5032021467172737490929599;
    '245|245':                                   The245245;
    '694|694':                                   The650650;
    '025':                                       The022;
    '020':                                       The020;
    '022':                                       The022;
    '240|240':                                   The240240;
    '600|600':                                   The100;
    '692|692':                                   The650650;
    '690|690':                                   The650650;
    '130|730':                                   The130730;
    '691|691':                                   The650650;
    '700|700':                                   The600;
    '082':                                       The082;
    '650|650':                                   The650650;
    '001':                                       The001;
    '008':                                       The008;
    '041':                                       The041;
    '653|653':                                   The650650;
}

export interface The001 {
    titleNumber: TitleNumber;
}

export interface TitleNumber {
    predicate: string;
    object:    TitleNumberObject;
}

export interface TitleNumberObject {
    datatype: Datatype;
}

export enum Datatype {
    Literal = 'literal',
    URI = 'uri',
}

export interface The008 {
    periodicaType:   Audience;
    language:        Language;
    biocontent:      Biocontent;
    script:          Audience;
    audience:        Audience;
    literaryformat:  Audience;
    cataloguingDate: CataloguingDate;
    contentCode:     ContentCode;
}

export interface Audience {
    predicate: string;
    object:    AudienceObject;
}

export interface AudienceObject {
    datatype:          Datatype;
    prefix:            string;
    substr_length:     number;
    regex_substitute?: PurpleRegexSubstitute;
    substr_offset:     number;
}

export interface PurpleRegexSubstitute {
    default: string;
    subs:    PurpleSubs;
    orig:    string;
}

export interface PurpleSubs {
    a?:   string;
    j?:   string;
    '0'?: string;
    '1'?: string;
    p?:   string;
    n?:   string;
    c?:   string;
    b?:   string;
    e?:   string;
    d?:   string;
    g?:   string;
    f?:   string;
    i?:   string;
    m?:   string;
    l?:   string;
}

export interface Biocontent {
    predicate: string;
    object:    BiocontentObject;
}

export interface BiocontentObject {
    datatype:         Datatype;
    prefix:           string;
    substr_length:    number;
    regex_substitute: FluffyRegexSubstitute;
    substr_offset:    number;
}

export interface FluffyRegexSubstitute {
    default: string;
    subs:    FluffySubs;
    orig:    string;
}

export interface FluffySubs {
    '0': string;
    '1': string;
    a:   string;
    c:   string;
    b:   string;
    d:   string;
}

export interface CataloguingDate {
    predicate: string;
    object:    CataloguingDateObject;
}

export interface CataloguingDateObject {
    datatype:      Datatype;
    substr_length: number;
    substr_offset: number;
}

export interface ContentCode {
    predicate: string;
    object:    ContentCodeObject;
}

export interface ContentCodeObject {
    prefix:           string;
    substr_length:    number;
    regex_substitute: TentacledRegexSubstitute;
    datatype:         Datatype;
    regex_split:      string;
    substr_offset:    number;
}

export interface TentacledRegexSubstitute {
    default: string;
    subs:    TentacledSubs;
    orig:    string;
}

export interface TentacledSubs {
    a: string;
    b: string;
    e: string;
    d: string;
    f: string;
    i: string;
    h: string;
    k: string;
    m: string;
    l: string;
    o: string;
    s: string;
    r: string;
    w: string;
    x: string;
}

export interface Language {
    predicate: string;
    object:    AudienceObject;
    relation:  LanguageRelation;
}

export interface LanguageRelation {
    class: string;
}

export interface The015 {
    subfield: The015_Subfield;
}

export interface The015_Subfield {
    a: PurpleA;
}

export interface PurpleA {
    object:     TitleNumberObject;
    conditions: PurpleConditions;
}

export interface PurpleConditions {
    subfield: PurpleSubfield;
}

export interface PurpleSubfield {
    b: PurpleB;
}

export interface PurpleB {
    subs: BSubs;
    orig: string;
}

export interface BSubs {
    dugnadsbasenibibliofil: string;
    bibbi:                  string;
    bibliofilid:            string;
}

export interface The019 {
    subfield: The019_Subfield;
}

export interface The019_Subfield {
    a: FluffyA;
    s: S;
    b: FluffyB;
    e: PurpleE;
    d: D;
}

export interface FluffyA {
    predicate: string;
    object:    PurpleObject;
}

export interface PurpleObject {
    datatype:          Datatype;
    prefix:            string;
    regex_split?:      string;
    regex_substitute?: StickyRegexSubstitute;
    regex_strip?:      string;
    urlize?:           boolean;
}

export interface StickyRegexSubstitute {
    default: string;
    subs:    StickySubs;
    orig:    string;
}

export interface StickySubs {
    a:  string;
    bu: string;
    b:  string;
    u:  string;
    mu: string;
}

export interface FluffyB {
    predicate: string;
    object:    FluffyObject;
}

export interface FluffyObject {
    datatype:          Datatype;
    prefix:            string;
    regex_split?:      string;
    regex_substitute?: IndigoRegexSubstitute;
    regex_strip?:      RegexStrip;
    urlize?:           boolean;
}

export enum RegexStrip {
    HTTP = '^.*?(?=http)',
    W = '[\\W]+',
}

export interface IndigoRegexSubstitute {
    default: string;
    subs:    IndigoSubs;
    orig:    string;
}

export interface IndigoSubs {
    ab: string;
    ee: string;
    ed: string;
    ef: string;
    vo: string;
    gg: string;
    ge: string;
    gd: string;
    gc: string;
    gb: string;
    ga: string;
    ic: string;
    ib: string;
    gi: string;
    gt: string;
    na: string;
    j:  string;
    dj: string;
    dh: string;
    di: string;
    dg: string;
    dd: string;
    de: string;
    db: string;
    dc: string;
    da: string;
    dz: string;
    ff: string;
    fm: string;
    a:  string;
    c:  string;
    b:  string;
    ma: string;
    mc: string;
    mb: string;
    h:  string;
    mo: string;
    mn: string;
    l:  string;
    mj: string;
    sm: string;
    fd: string;
}

export interface D {
    predicate: string;
    object:    TentacledObject;
}

export interface TentacledObject {
    datatype:          Datatype;
    prefix:            string;
    regex_split?:      string;
    regex_substitute?: IndecentRegexSubstitute;
    regex_strip?:      RegexStrip;
}

export interface IndecentRegexSubstitute {
    default: string;
    subs:    IndecentSubs;
    orig:    string;
}

export interface IndecentSubs {
    a: string;
    b: string;
    d: string;
    l: string;
    n: string;
    p: string;
    s: string;
    r: string;
    t: string;
}

export interface PurpleE {
    predicate: string;
    object:    StickyObject;
}

export interface StickyObject {
    datatype:         Datatype;
    prefix:           string;
    regex_split:      string;
    regex_substitute: HilariousRegexSubstitute;
}

export interface HilariousRegexSubstitute {
    default: string;
    subs:    HilariousSubs;
    orig:    string;
}

export interface HilariousSubs {
    tj: string;
    tf: string;
    tg: string;
    td: string;
    te: string;
    tb: string;
    tc: string;
    ta: string;
}

export interface S {
    predicate: string;
    object:    SObject;
}

export interface SObject {
    datatype:    Datatype;
    regex_strip: string;
    prefix:      string;
}

export interface The020 {
    subfield: The020_Subfield;
}

export interface The020_Subfield {
    a: BClass;
    c: TitleNumber;
    b: S;
}

export interface BClass {
    predicate: string;
    object:    PObject;
}

export interface PObject {
    datatype:    Datatype;
    regex_strip: string;
}

export interface The022 {
    subfield: The022_Subfield;
}

export interface The022_Subfield {
    a: BClass;
}

export interface The041 {
    subfield: The041_Subfield;
}

export interface The041_Subfield {
    a: TentacledA;
    h: HClass;
    b: HClass;
}

export interface TentacledA {
    predicate: string;
    object:    IndigoObject;
    relation:  LanguageRelation;
}

export interface IndigoObject {
    datatype:     Datatype;
    regex_strip:  string;
    prefix:       string;
    regex_split?: string;
    urlize?:      boolean;
}

export interface HClass {
    predicate: string;
    object:    HObject;
}

export interface HObject {
    datatype:    Datatype;
    regex_strip: RegexStrip;
    prefix:      string;
    regex_split: string;
}

export interface The082 {
    subfield: The082_Subfield;
}

export interface The082_Subfield {
    a: StickyA;
}

export interface StickyA {
    object:     PObject;
    conditions: FluffyConditions;
}

export interface FluffyConditions {
    indicator: PurpleIndicator;
}

export interface PurpleIndicator {
    default:    string;
    indicator1: Indicator1;
}

export interface Indicator1 {
    subs: Indicator1Subs;
    orig: string;
}

export interface Indicator1Subs {
    '3': string;
    ' ': string;
}

export interface The090 {
    subfield: The090_Subfield;
}

export interface The090_Subfield {
    a: TitleNumber;
    c: TitleNumber;
    b: TitleNumber;
    d: TitleNumber;
}

export interface The092 {
    subfield: The092_Subfield;
}

export interface The092_Subfield {
    a: TitleNumber;
}

export interface The100 {
    subfield: The100_Subfield;
}

export interface The100_Subfield {
    '3': Purple3;
}

export interface Purple3 {
    predicate: string;
    object:    IndecentObject;
    relation:  PurpleRelation;
}

export interface IndecentObject {
    datatype: Datatype;
    prefix:   string;
}

export interface PurpleRelation {
    subfield: FluffySubfield;
    class:    string;
}

export interface FluffySubfield {
    '1': TitleNumber;
    '3': TitleNumber;
    a:   TitleNumber;
    c:   TitleNumber;
    d:   TitleNumber;
    j?:  HClass;
    q?:  TitleNumber;
    n?:  TitleNumber;
    b?:  TitleNumber;
}

export interface The110 {
    subfield: The110_Subfield;
}

export interface The110_Subfield {
    '3': Fluffy3;
}

export interface Fluffy3 {
    predicate: string;
    object:    IndecentObject;
    relation:  FluffyRelation;
}

export interface FluffyRelation {
    subfield: TentacledSubfield;
    class:    string;
}

export interface TentacledSubfield {
    '1': TitleNumber;
    '3': TitleNumber;
    a:   IndigoA;
    c:   TitleNumber;
    d:   TitleNumber;
    n:   TitleNumber;
}

export interface IndigoA {
    predicate: string;
    object:    HilariousObject;
}

export interface HilariousObject {
    datatype:      Datatype;
    combinestring: Combinestring;
    combine:       string[];
    lang?:         string;
}

export enum Combinestring {
    Combinestring = ' - ',
    Empty = '. ',
}

export interface The130730 {
    subfield: The130730_Subfield;
}

export interface The130730_Subfield {
    '3': Tentacled3;
}

export interface Tentacled3 {
    predicate: string;
    object:    IndigoObject;
    relation:  TentacledRelation;
}

export interface TentacledRelation {
    subfield: StickySubfield;
    class:    Class;
}

export enum Class {
    FABIOWork = 'FABIO.Work',
    SKOSConcept = 'SKOS.Concept',
    YAGOLiteraryGenres = 'YAGO.LiteraryGenres',
}

export interface StickySubfield {
    '1': TitleNumber;
    '3': TitleNumber;
    a:   IndigoA;
}

export interface The240 {
    subfield: The240_Subfield;
}

export interface The240_Subfield {
    a: IndecentA;
}

export interface IndecentA {
    object:     PObject;
    conditions: TentacledConditions;
}

export interface TentacledConditions {
    indicator: FluffyIndicator;
}

export interface FluffyIndicator {
    default:    string;
    indicator1: Indicator1Class;
}

export interface Indicator1Class {
    subs: { [key: string]: string };
    orig: string;
}

export interface The240240 {
    subfield: The240240_Subfield;
}

export interface The240240_Subfield {
    a: HilariousA;
}

export interface HilariousA {
    object:     UObject;
    conditions: TentacledConditions;
}

export interface UObject {
    datatype:    Datatype;
    regex_strip: RegexStrip;
    urlize:      boolean;
    prefix?:     string;
}

export interface The245 {
    subfield: The245_Subfield;
}

export interface The245_Subfield {
    a: BClass;
    p: BClass;
    c: BClass;
    b: BClass;
    n: TitleNumber;
}

export interface The245245 {
    subfield: The245245_Subfield;
}

export interface The245245_Subfield {
    a: UClass;
}

export interface UClass {
    predicate: string;
    object:    UObject;
}

export interface The246 {
    subfield: The246_Subfield;
}

export interface The246_Subfield {
    a: IndigoA;
    p: BClass;
    c: BClass;
    b: BClass;
    n: TitleNumber;
}

export interface The250 {
    subfield: The250_Subfield;
}

export interface The250_Subfield {
    a: TitleNumber;
    b: BClass;
}

export interface The260 {
    subfield: The260_Subfield;
}

export interface The260_Subfield {
    a: AmbitiousA;
    c: BClass;
    b: TentacledB;
}

export interface AmbitiousA {
    predicate: string;
    object:    PurpleObject;
    relation:  StickyRelation;
}

export interface StickyRelation {
    subfield: The022_Subfield;
    class:    string;
}

export interface TentacledB {
    predicate: string;
    object:    IndigoObject;
    relation:  BRelation;
}

export interface BRelation {
    subfield: IndigoSubfield;
    class:    string;
}

export interface IndigoSubfield {
    b: TitleNumber;
}

export interface The300 {
    subfield: The300_Subfield;
}

export interface The300_Subfield {
    a: BClass;
    c: TitleNumber;
    b: TitleNumber;
    e: TitleNumber;
}

export interface The440 {
    subfield: The440_Subfield;
}

export interface The440_Subfield {
    '3': Sticky3;
    v:   TitleNumber;
}

export interface Sticky3 {
    predicate: string;
    object:    IndecentObject;
    relation:  IndigoRelation;
}

export interface IndigoRelation {
    subfield: IndecentSubfield;
    class:    string;
}

export interface IndecentSubfield {
    '1': TitleNumber;
    '3': TitleNumber;
    a:   BClass;
    c:   BClass;
    p:   BClass;
    x:   TitleNumber;
}

export interface The600 {
    subfield: The600_Subfield;
}

export interface The600_Subfield {
    t: T;
}

export interface T {
    predicate: string;
    object:    AmbitiousObject;
    relation:  TRelation;
}

export interface AmbitiousObject {
    combinestring: string;
    prefix:        string;
    combine:       string[];
    urlize:        boolean;
    datatype:      Datatype;
    regex_strip:   string;
}

export interface TRelation {
    subfield: HilariousSubfield;
    class:    Class;
}

export interface HilariousSubfield {
    '1': TitleNumber;
    '3': Indigo3;
    t:   TitleNumber;
}

export interface Indigo3 {
    predicate: string;
    object:    IndecentObject;
}

export interface The630 {
    subfield: The630_Subfield;
}

export interface The630_Subfield {
    '3': Indecent3;
}

export interface Indecent3 {
    predicate: string;
    object:    IndecentObject;
    relation:  TentacledRelation;
}

export interface The650650 {
    subfield: The650650_Subfield;
}

export interface The650650_Subfield {
    a: CunningA;
}

export interface CunningA {
    predicate: string;
    object:    UObject;
    relation:  IndecentRelation;
}

export interface IndecentRelation {
    subfield: AmbitiousSubfield;
    class:    Class;
}

export interface AmbitiousSubfield {
    '3': Indigo3;
    a:   TitleNumber;
}

export interface The651 {
    subfield: The651_Subfield;
}

export interface The651_Subfield {
    '3': Hilarious3;
}

export interface Hilarious3 {
    predicate: string;
    object:    IndecentObject;
    relation:  HilariousRelation;
}

export interface HilariousRelation {
    subfield: CunningSubfield;
    class:    string;
}

export interface CunningSubfield {
    '1': TitleNumber;
    '3': TitleNumber;
    a:   MagentaA;
}

export interface MagentaA {
    predicate: string;
    object:    CunningObject;
}

export interface CunningObject {
    datatype:    Datatype;
    regex_strip: string;
    lang:        string;
}

export interface The652 {
    subfield: The652_Subfield;
}

export interface The652_Subfield {
    '3': Ambitious3;
}

export interface Ambitious3 {
    predicate: string;
    object:    IndecentObject;
    relation:  AmbitiousRelation;
}

export interface AmbitiousRelation {
    subfield: MagentaSubfield;
    class:    string;
}

export interface MagentaSubfield {
    '1': TitleNumber;
    '3': TitleNumber;
    a:   FriskyA;
}

export interface FriskyA {
    predicate: string;
    object:    MagentaObject;
}

export interface MagentaObject {
    datatype: Datatype;
    lang:     string;
}

export interface The695 {
    subfield: The695_Subfield;
}

export interface The695_Subfield {
    a: MischievousA;
}

export interface MischievousA {
    predicate: string;
    object:    PurpleObject;
    relation:  CunningRelation;
}

export interface CunningRelation {
    subfield: FriskySubfield;
    class:    string;
}

export interface FriskySubfield {
    '1': TitleNumber;
    a:   FriskyA;
}

export interface The699 {
    subfield: The699_Subfield;
}

export interface The699_Subfield {
    a: BraggadociousA;
}

export interface BraggadociousA {
    predicate: string;
    object:    AmbitiousObject;
    relation:  TentacledRelation;
}

export interface The700 {
    subfield: The700_Subfield;
}

export interface The700_Subfield {
    '3': Cunning3;
}

export interface Cunning3 {
    conditions: The3_Conditions;
    object:     IndecentObject;
    relation:   PurpleRelation;
}

export interface The3_Conditions {
    subfield: MischievousSubfield;
}

export interface MischievousSubfield {
    e: FluffyE;
}

export interface FluffyE {
    default: string;
    subs:    ESubs;
    orig:    string;
}

export interface ESubs {
    dir:       string;
    komp:      string;
    arr:       string;
    foto:      string;
    forf:      string;
    biogr:     string;
    utøv:      string;
    innl:      string;
    overs:     string;
    k:         string;
    fort:      string;
    medarb:    string;
    medforf:   string;
    gjendikt:  string;
    medf:      string;
    utg:       string;
    tekstf:    string;
    komm:      string;
    ill:       string;
    oppl:      string;
    manusforf: string;
    sang:      string;
    skuesp:    string;
    u:         string;
    t:         string;
    bearb:     string;
    eks:       string;
    reg:       string;
    red:       string;
}

export interface The710 {
    subfield: The710_Subfield;
}

export interface The710_Subfield {
    '3': Magenta3;
}

export interface Magenta3 {
    predicate: string;
    object:    IndecentObject;
    relation:  MagentaRelation;
}

export interface MagentaRelation {
    subfield: BraggadociousSubfield;
    class:    string;
}

export interface BraggadociousSubfield {
    '1': TitleNumber;
    '3': TitleNumber;
    a:   TitleNumber;
}

export interface The740 {
    subfield: The740_Subfield;
}

export interface The740_Subfield {
    a: A1;
}

export interface A1 {
    object:     TitleNumberObject;
    conditions: StickyConditions;
}

export interface StickyConditions {
    indicator: TentacledIndicator;
}

export interface TentacledIndicator {
    default:    string;
    indicator2: Indicator1Class;
}

export interface The760 {
    subfield: The760_Subfield;
}

export interface The760_Subfield {
    w: S;
}

export interface The856 {
    subfield: The856_Subfield;
}

export interface The856_Subfield {
    u: UClass;
}

export interface The5032021467172737490929599 {
    subfield: The5032021467172737490929599_Subfield;
}

export interface The5032021467172737490929599_Subfield {
    a: FriskyA;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toTypes(json: string): MappingTypes {
        return cast(JSON.parse(json), r('Types'))
    }

    public static typesToJson(value: MappingTypes): string {
        return JSON.stringify(uncast(value, r('Types')), null, 2)
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
    'Types': o([
        { json: 'tags', js: 'tags', typ: r('Tags') },
    ], false),
    'Tags': o([
        { json: '100', js: '100', typ: r('The100') },
        { json: '110', js: '110', typ: r('The110') },
        { json: '111', js: '111', typ: r('The100') },
        { json: '240', js: '240', typ: r('The240') },
        { json: '245', js: '245', typ: r('The245') },
        { json: '246', js: '246', typ: r('The246') },
        { json: '250', js: '250', typ: r('The250') },
        { json: '260', js: '260', typ: r('The260') },
        { json: '300', js: '300', typ: r('The300') },
        { json: '440', js: '440', typ: r('The440') },
        { json: '503', js: '503', typ: r('The092') },
        { json: '520', js: '520', typ: r('The092') },
        { json: '521', js: '521', typ: r('The092') },
        { json: '546', js: '546', typ: r('The092') },
        { json: '571', js: '571', typ: r('The092') },
        { json: '572', js: '572', typ: r('The092') },
        { json: '573', js: '573', typ: r('The092') },
        { json: '574', js: '574', typ: r('The092') },
        { json: '590', js: '590', typ: r('The092') },
        { json: '592', js: '592', typ: r('The092') },
        { json: '595', js: '595', typ: r('The092') },
        { json: '599', js: '599', typ: r('The092') },
        { json: '600', js: '600', typ: r('The600') },
        { json: '630', js: '630', typ: r('The630') },
        { json: '650', js: '650', typ: r('The630') },
        { json: '651', js: '651', typ: r('The651') },
        { json: '652', js: '652', typ: r('The652') },
        { json: '653', js: '653', typ: r('The630') },
        { json: '655', js: '655', typ: r('The630') },
        { json: '690', js: '690', typ: r('The630') },
        { json: '691', js: '691', typ: r('The630') },
        { json: '692', js: '692', typ: r('The630') },
        { json: '693', js: '693', typ: r('The630') },
        { json: '694', js: '694', typ: r('The630') },
        { json: '695', js: '695', typ: r('The695') },
        { json: '699', js: '699', typ: r('The699') },
        { json: '700', js: '700', typ: r('The700') },
        { json: '710', js: '710', typ: r('The710') },
        { json: '711', js: '711', typ: r('The710') },
        { json: '740', js: '740', typ: r('The740') },
        { json: '760', js: '760', typ: r('The760') },
        { json: '780', js: '780', typ: r('The760') },
        { json: '785', js: '785', typ: r('The760') },
        { json: '856', js: '856', typ: r('The856') },
        { json: '099', js: '099', typ: r('The092') },
        { json: '090', js: '090', typ: r('The090') },
        { json: '092', js: '092', typ: r('The092') },
        { json: '015', js: '015', typ: r('The015') },
        { json: '019', js: '019', typ: r('The019') },
        { json: '610|611', js: '610|611', typ: r('The110') },
        { json: '^5(?!03|20|21|46|71|72|73|74|90|92|95|99)', js: '^5(?!03|20|21|46|71|72|73|74|90|92|95|99)', typ: r('The5032021467172737490929599') },
        { json: '245|245', js: '245|245', typ: r('The245245') },
        { json: '694|694', js: '694|694', typ: r('The650650') },
        { json: '025', js: '025', typ: r('The022') },
        { json: '020', js: '020', typ: r('The020') },
        { json: '022', js: '022', typ: r('The022') },
        { json: '240|240', js: '240|240', typ: r('The240240') },
        { json: '600|600', js: '600|600', typ: r('The100') },
        { json: '692|692', js: '692|692', typ: r('The650650') },
        { json: '690|690', js: '690|690', typ: r('The650650') },
        { json: '130|730', js: '130|730', typ: r('The130730') },
        { json: '691|691', js: '691|691', typ: r('The650650') },
        { json: '700|700', js: '700|700', typ: r('The600') },
        { json: '082', js: '082', typ: r('The082') },
        { json: '650|650', js: '650|650', typ: r('The650650') },
        { json: '001', js: '001', typ: r('The001') },
        { json: '008', js: '008', typ: r('The008') },
        { json: '041', js: '041', typ: r('The041') },
        { json: '653|653', js: '653|653', typ: r('The650650') },
    ], false),
    'The001': o([
        { json: 'titleNumber', js: 'titleNumber', typ: r('TitleNumber') },
    ], false),
    'TitleNumber': o([
        { json: 'predicate', js: 'predicate', typ: '' },
        { json: 'object', js: 'object', typ: r('TitleNumberObject') },
    ], false),
    'TitleNumberObject': o([
        { json: 'datatype', js: 'datatype', typ: r('Datatype') },
    ], false),
    'The008': o([
        { json: 'periodicaType', js: 'periodicaType', typ: r('Audience') },
        { json: 'language', js: 'language', typ: r('Language') },
        { json: 'biocontent', js: 'biocontent', typ: r('Biocontent') },
        { json: 'script', js: 'script', typ: r('Audience') },
        { json: 'audience', js: 'audience', typ: r('Audience') },
        { json: 'literaryformat', js: 'literaryformat', typ: r('Audience') },
        { json: 'cataloguingDate', js: 'cataloguingDate', typ: r('CataloguingDate') },
        { json: 'contentCode', js: 'contentCode', typ: r('ContentCode') },
    ], false),
    'Audience': o([
        { json: 'predicate', js: 'predicate', typ: '' },
        { json: 'object', js: 'object', typ: r('AudienceObject') },
    ], false),
    'AudienceObject': o([
        { json: 'datatype', js: 'datatype', typ: r('Datatype') },
        { json: 'prefix', js: 'prefix', typ: '' },
        { json: 'substr_length', js: 'substr_length', typ: 0 },
        { json: 'regex_substitute', js: 'regex_substitute', typ: u(undefined, r('PurpleRegexSubstitute')) },
        { json: 'substr_offset', js: 'substr_offset', typ: 0 },
    ], false),
    'PurpleRegexSubstitute': o([
        { json: 'default', js: 'default', typ: '' },
        { json: 'subs', js: 'subs', typ: r('PurpleSubs') },
        { json: 'orig', js: 'orig', typ: '' },
    ], false),
    'PurpleSubs': o([
        { json: 'a', js: 'a', typ: u(undefined, '') },
        { json: 'j', js: 'j', typ: u(undefined, '') },
        { json: '0', js: '0', typ: u(undefined, '') },
        { json: '1', js: '1', typ: u(undefined, '') },
        { json: 'p', js: 'p', typ: u(undefined, '') },
        { json: 'n', js: 'n', typ: u(undefined, '') },
        { json: 'c', js: 'c', typ: u(undefined, '') },
        { json: 'b', js: 'b', typ: u(undefined, '') },
        { json: 'e', js: 'e', typ: u(undefined, '') },
        { json: 'd', js: 'd', typ: u(undefined, '') },
        { json: 'g', js: 'g', typ: u(undefined, '') },
        { json: 'f', js: 'f', typ: u(undefined, '') },
        { json: 'i', js: 'i', typ: u(undefined, '') },
        { json: 'm', js: 'm', typ: u(undefined, '') },
        { json: 'l', js: 'l', typ: u(undefined, '') },
    ], false),
    'Biocontent': o([
        { json: 'predicate', js: 'predicate', typ: '' },
        { json: 'object', js: 'object', typ: r('BiocontentObject') },
    ], false),
    'BiocontentObject': o([
        { json: 'datatype', js: 'datatype', typ: r('Datatype') },
        { json: 'prefix', js: 'prefix', typ: '' },
        { json: 'substr_length', js: 'substr_length', typ: 0 },
        { json: 'regex_substitute', js: 'regex_substitute', typ: r('FluffyRegexSubstitute') },
        { json: 'substr_offset', js: 'substr_offset', typ: 0 },
    ], false),
    'FluffyRegexSubstitute': o([
        { json: 'default', js: 'default', typ: '' },
        { json: 'subs', js: 'subs', typ: r('FluffySubs') },
        { json: 'orig', js: 'orig', typ: '' },
    ], false),
    'FluffySubs': o([
        { json: '0', js: '0', typ: '' },
        { json: '1', js: '1', typ: '' },
        { json: 'a', js: 'a', typ: '' },
        { json: 'c', js: 'c', typ: '' },
        { json: 'b', js: 'b', typ: '' },
        { json: 'd', js: 'd', typ: '' },
    ], false),
    'CataloguingDate': o([
        { json: 'predicate', js: 'predicate', typ: '' },
        { json: 'object', js: 'object', typ: r('CataloguingDateObject') },
    ], false),
    'CataloguingDateObject': o([
        { json: 'datatype', js: 'datatype', typ: r('Datatype') },
        { json: 'substr_length', js: 'substr_length', typ: 0 },
        { json: 'substr_offset', js: 'substr_offset', typ: 0 },
    ], false),
    'ContentCode': o([
        { json: 'predicate', js: 'predicate', typ: '' },
        { json: 'object', js: 'object', typ: r('ContentCodeObject') },
    ], false),
    'ContentCodeObject': o([
        { json: 'prefix', js: 'prefix', typ: '' },
        { json: 'substr_length', js: 'substr_length', typ: 0 },
        { json: 'regex_substitute', js: 'regex_substitute', typ: r('TentacledRegexSubstitute') },
        { json: 'datatype', js: 'datatype', typ: r('Datatype') },
        { json: 'regex_split', js: 'regex_split', typ: '' },
        { json: 'substr_offset', js: 'substr_offset', typ: 0 },
    ], false),
    'TentacledRegexSubstitute': o([
        { json: 'default', js: 'default', typ: '' },
        { json: 'subs', js: 'subs', typ: r('TentacledSubs') },
        { json: 'orig', js: 'orig', typ: '' },
    ], false),
    'TentacledSubs': o([
        { json: 'a', js: 'a', typ: '' },
        { json: 'b', js: 'b', typ: '' },
        { json: 'e', js: 'e', typ: '' },
        { json: 'd', js: 'd', typ: '' },
        { json: 'f', js: 'f', typ: '' },
        { json: 'i', js: 'i', typ: '' },
        { json: 'h', js: 'h', typ: '' },
        { json: 'k', js: 'k', typ: '' },
        { json: 'm', js: 'm', typ: '' },
        { json: 'l', js: 'l', typ: '' },
        { json: 'o', js: 'o', typ: '' },
        { json: 's', js: 's', typ: '' },
        { json: 'r', js: 'r', typ: '' },
        { json: 'w', js: 'w', typ: '' },
        { json: 'x', js: 'x', typ: '' },
    ], false),
    'Language': o([
        { json: 'predicate', js: 'predicate', typ: '' },
        { json: 'object', js: 'object', typ: r('AudienceObject') },
        { json: 'relation', js: 'relation', typ: r('LanguageRelation') },
    ], false),
    'LanguageRelation': o([
        { json: 'class', js: 'class', typ: '' },
    ], false),
    'The015': o([
        { json: 'subfield', js: 'subfield', typ: r('The015_Subfield') },
    ], false),
    'The015_Subfield': o([
        { json: 'a', js: 'a', typ: r('PurpleA') },
    ], false),
    'PurpleA': o([
        { json: 'object', js: 'object', typ: r('TitleNumberObject') },
        { json: 'conditions', js: 'conditions', typ: r('PurpleConditions') },
    ], false),
    'PurpleConditions': o([
        { json: 'subfield', js: 'subfield', typ: r('PurpleSubfield') },
    ], false),
    'PurpleSubfield': o([
        { json: 'b', js: 'b', typ: r('PurpleB') },
    ], false),
    'PurpleB': o([
        { json: 'subs', js: 'subs', typ: r('BSubs') },
        { json: 'orig', js: 'orig', typ: '' },
    ], false),
    'BSubs': o([
        { json: 'dugnadsbasenibibliofil', js: 'dugnadsbasenibibliofil', typ: '' },
        { json: 'bibbi', js: 'bibbi', typ: '' },
        { json: 'bibliofilid', js: 'bibliofilid', typ: '' },
    ], false),
    'The019': o([
        { json: 'subfield', js: 'subfield', typ: r('The019_Subfield') },
    ], false),
    'The019_Subfield': o([
        { json: 'a', js: 'a', typ: r('FluffyA') },
        { json: 's', js: 's', typ: r('S') },
        { json: 'b', js: 'b', typ: r('FluffyB') },
        { json: 'e', js: 'e', typ: r('PurpleE') },
        { json: 'd', js: 'd', typ: r('D') },
    ], false),
    'FluffyA': o([
        { json: 'predicate', js: 'predicate', typ: '' },
        { json: 'object', js: 'object', typ: r('PurpleObject') },
    ], false),
    'PurpleObject': o([
        { json: 'datatype', js: 'datatype', typ: r('Datatype') },
        { json: 'prefix', js: 'prefix', typ: '' },
        { json: 'regex_split', js: 'regex_split', typ: u(undefined, '') },
        { json: 'regex_substitute', js: 'regex_substitute', typ: u(undefined, r('StickyRegexSubstitute')) },
        { json: 'regex_strip', js: 'regex_strip', typ: u(undefined, '') },
        { json: 'urlize', js: 'urlize', typ: u(undefined, true) },
    ], false),
    'StickyRegexSubstitute': o([
        { json: 'default', js: 'default', typ: '' },
        { json: 'subs', js: 'subs', typ: r('StickySubs') },
        { json: 'orig', js: 'orig', typ: '' },
    ], false),
    'StickySubs': o([
        { json: 'a', js: 'a', typ: '' },
        { json: 'bu', js: 'bu', typ: '' },
        { json: 'b', js: 'b', typ: '' },
        { json: 'u', js: 'u', typ: '' },
        { json: 'mu', js: 'mu', typ: '' },
    ], false),
    'FluffyB': o([
        { json: 'predicate', js: 'predicate', typ: '' },
        { json: 'object', js: 'object', typ: r('FluffyObject') },
    ], false),
    'FluffyObject': o([
        { json: 'datatype', js: 'datatype', typ: r('Datatype') },
        { json: 'prefix', js: 'prefix', typ: '' },
        { json: 'regex_split', js: 'regex_split', typ: u(undefined, '') },
        { json: 'regex_substitute', js: 'regex_substitute', typ: u(undefined, r('IndigoRegexSubstitute')) },
        { json: 'regex_strip', js: 'regex_strip', typ: u(undefined, r('RegexStrip')) },
        { json: 'urlize', js: 'urlize', typ: u(undefined, true) },
    ], false),
    'IndigoRegexSubstitute': o([
        { json: 'default', js: 'default', typ: '' },
        { json: 'subs', js: 'subs', typ: r('IndigoSubs') },
        { json: 'orig', js: 'orig', typ: '' },
    ], false),
    'IndigoSubs': o([
        { json: 'ab', js: 'ab', typ: '' },
        { json: 'ee', js: 'ee', typ: '' },
        { json: 'ed', js: 'ed', typ: '' },
        { json: 'ef', js: 'ef', typ: '' },
        { json: 'vo', js: 'vo', typ: '' },
        { json: 'gg', js: 'gg', typ: '' },
        { json: 'ge', js: 'ge', typ: '' },
        { json: 'gd', js: 'gd', typ: '' },
        { json: 'gc', js: 'gc', typ: '' },
        { json: 'gb', js: 'gb', typ: '' },
        { json: 'ga', js: 'ga', typ: '' },
        { json: 'ic', js: 'ic', typ: '' },
        { json: 'ib', js: 'ib', typ: '' },
        { json: 'gi', js: 'gi', typ: '' },
        { json: 'gt', js: 'gt', typ: '' },
        { json: 'na', js: 'na', typ: '' },
        { json: 'j', js: 'j', typ: '' },
        { json: 'dj', js: 'dj', typ: '' },
        { json: 'dh', js: 'dh', typ: '' },
        { json: 'di', js: 'di', typ: '' },
        { json: 'dg', js: 'dg', typ: '' },
        { json: 'dd', js: 'dd', typ: '' },
        { json: 'de', js: 'de', typ: '' },
        { json: 'db', js: 'db', typ: '' },
        { json: 'dc', js: 'dc', typ: '' },
        { json: 'da', js: 'da', typ: '' },
        { json: 'dz', js: 'dz', typ: '' },
        { json: 'ff', js: 'ff', typ: '' },
        { json: 'fm', js: 'fm', typ: '' },
        { json: 'a', js: 'a', typ: '' },
        { json: 'c', js: 'c', typ: '' },
        { json: 'b', js: 'b', typ: '' },
        { json: 'ma', js: 'ma', typ: '' },
        { json: 'mc', js: 'mc', typ: '' },
        { json: 'mb', js: 'mb', typ: '' },
        { json: 'h', js: 'h', typ: '' },
        { json: 'mo', js: 'mo', typ: '' },
        { json: 'mn', js: 'mn', typ: '' },
        { json: 'l', js: 'l', typ: '' },
        { json: 'mj', js: 'mj', typ: '' },
        { json: 'sm', js: 'sm', typ: '' },
        { json: 'fd', js: 'fd', typ: '' },
    ], false),
    'D': o([
        { json: 'predicate', js: 'predicate', typ: '' },
        { json: 'object', js: 'object', typ: r('TentacledObject') },
    ], false),
    'TentacledObject': o([
        { json: 'datatype', js: 'datatype', typ: r('Datatype') },
        { json: 'prefix', js: 'prefix', typ: '' },
        { json: 'regex_split', js: 'regex_split', typ: u(undefined, '') },
        { json: 'regex_substitute', js: 'regex_substitute', typ: u(undefined, r('IndecentRegexSubstitute')) },
        { json: 'regex_strip', js: 'regex_strip', typ: u(undefined, r('RegexStrip')) },
    ], false),
    'IndecentRegexSubstitute': o([
        { json: 'default', js: 'default', typ: '' },
        { json: 'subs', js: 'subs', typ: r('IndecentSubs') },
        { json: 'orig', js: 'orig', typ: '' },
    ], false),
    'IndecentSubs': o([
        { json: 'a', js: 'a', typ: '' },
        { json: 'b', js: 'b', typ: '' },
        { json: 'd', js: 'd', typ: '' },
        { json: 'l', js: 'l', typ: '' },
        { json: 'n', js: 'n', typ: '' },
        { json: 'p', js: 'p', typ: '' },
        { json: 's', js: 's', typ: '' },
        { json: 'r', js: 'r', typ: '' },
        { json: 't', js: 't', typ: '' },
    ], false),
    'PurpleE': o([
        { json: 'predicate', js: 'predicate', typ: '' },
        { json: 'object', js: 'object', typ: r('StickyObject') },
    ], false),
    'StickyObject': o([
        { json: 'datatype', js: 'datatype', typ: r('Datatype') },
        { json: 'prefix', js: 'prefix', typ: '' },
        { json: 'regex_split', js: 'regex_split', typ: '' },
        { json: 'regex_substitute', js: 'regex_substitute', typ: r('HilariousRegexSubstitute') },
    ], false),
    'HilariousRegexSubstitute': o([
        { json: 'default', js: 'default', typ: '' },
        { json: 'subs', js: 'subs', typ: r('HilariousSubs') },
        { json: 'orig', js: 'orig', typ: '' },
    ], false),
    'HilariousSubs': o([
        { json: 'tj', js: 'tj', typ: '' },
        { json: 'tf', js: 'tf', typ: '' },
        { json: 'tg', js: 'tg', typ: '' },
        { json: 'td', js: 'td', typ: '' },
        { json: 'te', js: 'te', typ: '' },
        { json: 'tb', js: 'tb', typ: '' },
        { json: 'tc', js: 'tc', typ: '' },
        { json: 'ta', js: 'ta', typ: '' },
    ], false),
    'S': o([
        { json: 'predicate', js: 'predicate', typ: '' },
        { json: 'object', js: 'object', typ: r('SObject') },
    ], false),
    'SObject': o([
        { json: 'datatype', js: 'datatype', typ: r('Datatype') },
        { json: 'regex_strip', js: 'regex_strip', typ: '' },
        { json: 'prefix', js: 'prefix', typ: '' },
    ], false),
    'The020': o([
        { json: 'subfield', js: 'subfield', typ: r('The020_Subfield') },
    ], false),
    'The020_Subfield': o([
        { json: 'a', js: 'a', typ: r('BClass') },
        { json: 'c', js: 'c', typ: r('TitleNumber') },
        { json: 'b', js: 'b', typ: r('S') },
    ], false),
    'BClass': o([
        { json: 'predicate', js: 'predicate', typ: '' },
        { json: 'object', js: 'object', typ: r('PObject') },
    ], false),
    'PObject': o([
        { json: 'datatype', js: 'datatype', typ: r('Datatype') },
        { json: 'regex_strip', js: 'regex_strip', typ: '' },
    ], false),
    'The022': o([
        { json: 'subfield', js: 'subfield', typ: r('The022_Subfield') },
    ], false),
    'The022_Subfield': o([
        { json: 'a', js: 'a', typ: r('BClass') },
    ], false),
    'The041': o([
        { json: 'subfield', js: 'subfield', typ: r('The041_Subfield') },
    ], false),
    'The041_Subfield': o([
        { json: 'a', js: 'a', typ: r('TentacledA') },
        { json: 'h', js: 'h', typ: r('HClass') },
        { json: 'b', js: 'b', typ: r('HClass') },
    ], false),
    'TentacledA': o([
        { json: 'predicate', js: 'predicate', typ: '' },
        { json: 'object', js: 'object', typ: r('IndigoObject') },
        { json: 'relation', js: 'relation', typ: r('LanguageRelation') },
    ], false),
    'IndigoObject': o([
        { json: 'datatype', js: 'datatype', typ: r('Datatype') },
        { json: 'regex_strip', js: 'regex_strip', typ: '' },
        { json: 'prefix', js: 'prefix', typ: '' },
        { json: 'regex_split', js: 'regex_split', typ: u(undefined, '') },
        { json: 'urlize', js: 'urlize', typ: u(undefined, true) },
    ], false),
    'HClass': o([
        { json: 'predicate', js: 'predicate', typ: '' },
        { json: 'object', js: 'object', typ: r('HObject') },
    ], false),
    'HObject': o([
        { json: 'datatype', js: 'datatype', typ: r('Datatype') },
        { json: 'regex_strip', js: 'regex_strip', typ: r('RegexStrip') },
        { json: 'prefix', js: 'prefix', typ: '' },
        { json: 'regex_split', js: 'regex_split', typ: '' },
    ], false),
    'The082': o([
        { json: 'subfield', js: 'subfield', typ: r('The082_Subfield') },
    ], false),
    'The082_Subfield': o([
        { json: 'a', js: 'a', typ: r('StickyA') },
    ], false),
    'StickyA': o([
        { json: 'object', js: 'object', typ: r('PObject') },
        { json: 'conditions', js: 'conditions', typ: r('FluffyConditions') },
    ], false),
    'FluffyConditions': o([
        { json: 'indicator', js: 'indicator', typ: r('PurpleIndicator') },
    ], false),
    'PurpleIndicator': o([
        { json: 'default', js: 'default', typ: '' },
        { json: 'indicator1', js: 'indicator1', typ: r('Indicator1') },
    ], false),
    'Indicator1': o([
        { json: 'subs', js: 'subs', typ: r('Indicator1Subs') },
        { json: 'orig', js: 'orig', typ: '' },
    ], false),
    'Indicator1Subs': o([
        { json: '3', js: '3', typ: '' },
        { json: ' ', js: ' ', typ: '' },
    ], false),
    'The090': o([
        { json: 'subfield', js: 'subfield', typ: r('The090_Subfield') },
    ], false),
    'The090_Subfield': o([
        { json: 'a', js: 'a', typ: r('TitleNumber') },
        { json: 'c', js: 'c', typ: r('TitleNumber') },
        { json: 'b', js: 'b', typ: r('TitleNumber') },
        { json: 'd', js: 'd', typ: r('TitleNumber') },
    ], false),
    'The092': o([
        { json: 'subfield', js: 'subfield', typ: r('The092_Subfield') },
    ], false),
    'The092_Subfield': o([
        { json: 'a', js: 'a', typ: r('TitleNumber') },
    ], false),
    'The100': o([
        { json: 'subfield', js: 'subfield', typ: r('The100_Subfield') },
    ], false),
    'The100_Subfield': o([
        { json: '3', js: '3', typ: r('Purple3') },
    ], false),
    'Purple3': o([
        { json: 'predicate', js: 'predicate', typ: '' },
        { json: 'object', js: 'object', typ: r('IndecentObject') },
        { json: 'relation', js: 'relation', typ: r('PurpleRelation') },
    ], false),
    'IndecentObject': o([
        { json: 'datatype', js: 'datatype', typ: r('Datatype') },
        { json: 'prefix', js: 'prefix', typ: '' },
    ], false),
    'PurpleRelation': o([
        { json: 'subfield', js: 'subfield', typ: r('FluffySubfield') },
        { json: 'class', js: 'class', typ: '' },
    ], false),
    'FluffySubfield': o([
        { json: '1', js: '1', typ: r('TitleNumber') },
        { json: '3', js: '3', typ: r('TitleNumber') },
        { json: 'a', js: 'a', typ: r('TitleNumber') },
        { json: 'c', js: 'c', typ: r('TitleNumber') },
        { json: 'd', js: 'd', typ: r('TitleNumber') },
        { json: 'j', js: 'j', typ: u(undefined, r('HClass')) },
        { json: 'q', js: 'q', typ: u(undefined, r('TitleNumber')) },
        { json: 'n', js: 'n', typ: u(undefined, r('TitleNumber')) },
        { json: 'b', js: 'b', typ: u(undefined, r('TitleNumber')) },
    ], false),
    'The110': o([
        { json: 'subfield', js: 'subfield', typ: r('The110_Subfield') },
    ], false),
    'The110_Subfield': o([
        { json: '3', js: '3', typ: r('Fluffy3') },
    ], false),
    'Fluffy3': o([
        { json: 'predicate', js: 'predicate', typ: '' },
        { json: 'object', js: 'object', typ: r('IndecentObject') },
        { json: 'relation', js: 'relation', typ: r('FluffyRelation') },
    ], false),
    'FluffyRelation': o([
        { json: 'subfield', js: 'subfield', typ: r('TentacledSubfield') },
        { json: 'class', js: 'class', typ: '' },
    ], false),
    'TentacledSubfield': o([
        { json: '1', js: '1', typ: r('TitleNumber') },
        { json: '3', js: '3', typ: r('TitleNumber') },
        { json: 'a', js: 'a', typ: r('IndigoA') },
        { json: 'c', js: 'c', typ: r('TitleNumber') },
        { json: 'd', js: 'd', typ: r('TitleNumber') },
        { json: 'n', js: 'n', typ: r('TitleNumber') },
    ], false),
    'IndigoA': o([
        { json: 'predicate', js: 'predicate', typ: '' },
        { json: 'object', js: 'object', typ: r('HilariousObject') },
    ], false),
    'HilariousObject': o([
        { json: 'datatype', js: 'datatype', typ: r('Datatype') },
        { json: 'combinestring', js: 'combinestring', typ: r('Combinestring') },
        { json: 'combine', js: 'combine', typ: a('') },
        { json: 'lang', js: 'lang', typ: u(undefined, '') },
    ], false),
    'The130730': o([
        { json: 'subfield', js: 'subfield', typ: r('The130730_Subfield') },
    ], false),
    'The130730_Subfield': o([
        { json: '3', js: '3', typ: r('Tentacled3') },
    ], false),
    'Tentacled3': o([
        { json: 'predicate', js: 'predicate', typ: '' },
        { json: 'object', js: 'object', typ: r('IndigoObject') },
        { json: 'relation', js: 'relation', typ: r('TentacledRelation') },
    ], false),
    'TentacledRelation': o([
        { json: 'subfield', js: 'subfield', typ: r('StickySubfield') },
        { json: 'class', js: 'class', typ: r('Class') },
    ], false),
    'StickySubfield': o([
        { json: '1', js: '1', typ: r('TitleNumber') },
        { json: '3', js: '3', typ: r('TitleNumber') },
        { json: 'a', js: 'a', typ: r('IndigoA') },
    ], false),
    'The240': o([
        { json: 'subfield', js: 'subfield', typ: r('The240_Subfield') },
    ], false),
    'The240_Subfield': o([
        { json: 'a', js: 'a', typ: r('IndecentA') },
    ], false),
    'IndecentA': o([
        { json: 'object', js: 'object', typ: r('PObject') },
        { json: 'conditions', js: 'conditions', typ: r('TentacledConditions') },
    ], false),
    'TentacledConditions': o([
        { json: 'indicator', js: 'indicator', typ: r('FluffyIndicator') },
    ], false),
    'FluffyIndicator': o([
        { json: 'default', js: 'default', typ: '' },
        { json: 'indicator1', js: 'indicator1', typ: r('Indicator1Class') },
    ], false),
    'Indicator1Class': o([
        { json: 'subs', js: 'subs', typ: m('') },
        { json: 'orig', js: 'orig', typ: '' },
    ], false),
    'The240240': o([
        { json: 'subfield', js: 'subfield', typ: r('The240240_Subfield') },
    ], false),
    'The240240_Subfield': o([
        { json: 'a', js: 'a', typ: r('HilariousA') },
    ], false),
    'HilariousA': o([
        { json: 'object', js: 'object', typ: r('UObject') },
        { json: 'conditions', js: 'conditions', typ: r('TentacledConditions') },
    ], false),
    'UObject': o([
        { json: 'datatype', js: 'datatype', typ: r('Datatype') },
        { json: 'regex_strip', js: 'regex_strip', typ: r('RegexStrip') },
        { json: 'urlize', js: 'urlize', typ: true },
        { json: 'prefix', js: 'prefix', typ: u(undefined, '') },
    ], false),
    'The245': o([
        { json: 'subfield', js: 'subfield', typ: r('The245_Subfield') },
    ], false),
    'The245_Subfield': o([
        { json: 'a', js: 'a', typ: r('BClass') },
        { json: 'p', js: 'p', typ: r('BClass') },
        { json: 'c', js: 'c', typ: r('BClass') },
        { json: 'b', js: 'b', typ: r('BClass') },
        { json: 'n', js: 'n', typ: r('TitleNumber') },
    ], false),
    'The245245': o([
        { json: 'subfield', js: 'subfield', typ: r('The245245_Subfield') },
    ], false),
    'The245245_Subfield': o([
        { json: 'a', js: 'a', typ: r('UClass') },
    ], false),
    'UClass': o([
        { json: 'predicate', js: 'predicate', typ: '' },
        { json: 'object', js: 'object', typ: r('UObject') },
    ], false),
    'The246': o([
        { json: 'subfield', js: 'subfield', typ: r('The246_Subfield') },
    ], false),
    'The246_Subfield': o([
        { json: 'a', js: 'a', typ: r('IndigoA') },
        { json: 'p', js: 'p', typ: r('BClass') },
        { json: 'c', js: 'c', typ: r('BClass') },
        { json: 'b', js: 'b', typ: r('BClass') },
        { json: 'n', js: 'n', typ: r('TitleNumber') },
    ], false),
    'The250': o([
        { json: 'subfield', js: 'subfield', typ: r('The250_Subfield') },
    ], false),
    'The250_Subfield': o([
        { json: 'a', js: 'a', typ: r('TitleNumber') },
        { json: 'b', js: 'b', typ: r('BClass') },
    ], false),
    'The260': o([
        { json: 'subfield', js: 'subfield', typ: r('The260_Subfield') },
    ], false),
    'The260_Subfield': o([
        { json: 'a', js: 'a', typ: r('AmbitiousA') },
        { json: 'c', js: 'c', typ: r('BClass') },
        { json: 'b', js: 'b', typ: r('TentacledB') },
    ], false),
    'AmbitiousA': o([
        { json: 'predicate', js: 'predicate', typ: '' },
        { json: 'object', js: 'object', typ: r('PurpleObject') },
        { json: 'relation', js: 'relation', typ: r('StickyRelation') },
    ], false),
    'StickyRelation': o([
        { json: 'subfield', js: 'subfield', typ: r('The022_Subfield') },
        { json: 'class', js: 'class', typ: '' },
    ], false),
    'TentacledB': o([
        { json: 'predicate', js: 'predicate', typ: '' },
        { json: 'object', js: 'object', typ: r('IndigoObject') },
        { json: 'relation', js: 'relation', typ: r('BRelation') },
    ], false),
    'BRelation': o([
        { json: 'subfield', js: 'subfield', typ: r('IndigoSubfield') },
        { json: 'class', js: 'class', typ: '' },
    ], false),
    'IndigoSubfield': o([
        { json: 'b', js: 'b', typ: r('TitleNumber') },
    ], false),
    'The300': o([
        { json: 'subfield', js: 'subfield', typ: r('The300_Subfield') },
    ], false),
    'The300_Subfield': o([
        { json: 'a', js: 'a', typ: r('BClass') },
        { json: 'c', js: 'c', typ: r('TitleNumber') },
        { json: 'b', js: 'b', typ: r('TitleNumber') },
        { json: 'e', js: 'e', typ: r('TitleNumber') },
    ], false),
    'The440': o([
        { json: 'subfield', js: 'subfield', typ: r('The440_Subfield') },
    ], false),
    'The440_Subfield': o([
        { json: '3', js: '3', typ: r('Sticky3') },
        { json: 'v', js: 'v', typ: r('TitleNumber') },
    ], false),
    'Sticky3': o([
        { json: 'predicate', js: 'predicate', typ: '' },
        { json: 'object', js: 'object', typ: r('IndecentObject') },
        { json: 'relation', js: 'relation', typ: r('IndigoRelation') },
    ], false),
    'IndigoRelation': o([
        { json: 'subfield', js: 'subfield', typ: r('IndecentSubfield') },
        { json: 'class', js: 'class', typ: '' },
    ], false),
    'IndecentSubfield': o([
        { json: '1', js: '1', typ: r('TitleNumber') },
        { json: '3', js: '3', typ: r('TitleNumber') },
        { json: 'a', js: 'a', typ: r('BClass') },
        { json: 'c', js: 'c', typ: r('BClass') },
        { json: 'p', js: 'p', typ: r('BClass') },
        { json: 'x', js: 'x', typ: r('TitleNumber') },
    ], false),
    'The600': o([
        { json: 'subfield', js: 'subfield', typ: r('The600_Subfield') },
    ], false),
    'The600_Subfield': o([
        { json: 't', js: 't', typ: r('T') },
    ], false),
    'T': o([
        { json: 'predicate', js: 'predicate', typ: '' },
        { json: 'object', js: 'object', typ: r('AmbitiousObject') },
        { json: 'relation', js: 'relation', typ: r('TRelation') },
    ], false),
    'AmbitiousObject': o([
        { json: 'combinestring', js: 'combinestring', typ: '' },
        { json: 'prefix', js: 'prefix', typ: '' },
        { json: 'combine', js: 'combine', typ: a('') },
        { json: 'urlize', js: 'urlize', typ: true },
        { json: 'datatype', js: 'datatype', typ: r('Datatype') },
        { json: 'regex_strip', js: 'regex_strip', typ: '' },
    ], false),
    'TRelation': o([
        { json: 'subfield', js: 'subfield', typ: r('HilariousSubfield') },
        { json: 'class', js: 'class', typ: r('Class') },
    ], false),
    'HilariousSubfield': o([
        { json: '1', js: '1', typ: r('TitleNumber') },
        { json: '3', js: '3', typ: r('Indigo3') },
        { json: 't', js: 't', typ: r('TitleNumber') },
    ], false),
    'Indigo3': o([
        { json: 'predicate', js: 'predicate', typ: '' },
        { json: 'object', js: 'object', typ: r('IndecentObject') },
    ], false),
    'The630': o([
        { json: 'subfield', js: 'subfield', typ: r('The630_Subfield') },
    ], false),
    'The630_Subfield': o([
        { json: '3', js: '3', typ: r('Indecent3') },
    ], false),
    'Indecent3': o([
        { json: 'predicate', js: 'predicate', typ: '' },
        { json: 'object', js: 'object', typ: r('IndecentObject') },
        { json: 'relation', js: 'relation', typ: r('TentacledRelation') },
    ], false),
    'The650650': o([
        { json: 'subfield', js: 'subfield', typ: r('The650650_Subfield') },
    ], false),
    'The650650_Subfield': o([
        { json: 'a', js: 'a', typ: r('CunningA') },
    ], false),
    'CunningA': o([
        { json: 'predicate', js: 'predicate', typ: '' },
        { json: 'object', js: 'object', typ: r('UObject') },
        { json: 'relation', js: 'relation', typ: r('IndecentRelation') },
    ], false),
    'IndecentRelation': o([
        { json: 'subfield', js: 'subfield', typ: r('AmbitiousSubfield') },
        { json: 'class', js: 'class', typ: r('Class') },
    ], false),
    'AmbitiousSubfield': o([
        { json: '3', js: '3', typ: r('Indigo3') },
        { json: 'a', js: 'a', typ: r('TitleNumber') },
    ], false),
    'The651': o([
        { json: 'subfield', js: 'subfield', typ: r('The651_Subfield') },
    ], false),
    'The651_Subfield': o([
        { json: '3', js: '3', typ: r('Hilarious3') },
    ], false),
    'Hilarious3': o([
        { json: 'predicate', js: 'predicate', typ: '' },
        { json: 'object', js: 'object', typ: r('IndecentObject') },
        { json: 'relation', js: 'relation', typ: r('HilariousRelation') },
    ], false),
    'HilariousRelation': o([
        { json: 'subfield', js: 'subfield', typ: r('CunningSubfield') },
        { json: 'class', js: 'class', typ: '' },
    ], false),
    'CunningSubfield': o([
        { json: '1', js: '1', typ: r('TitleNumber') },
        { json: '3', js: '3', typ: r('TitleNumber') },
        { json: 'a', js: 'a', typ: r('MagentaA') },
    ], false),
    'MagentaA': o([
        { json: 'predicate', js: 'predicate', typ: '' },
        { json: 'object', js: 'object', typ: r('CunningObject') },
    ], false),
    'CunningObject': o([
        { json: 'datatype', js: 'datatype', typ: r('Datatype') },
        { json: 'regex_strip', js: 'regex_strip', typ: '' },
        { json: 'lang', js: 'lang', typ: '' },
    ], false),
    'The652': o([
        { json: 'subfield', js: 'subfield', typ: r('The652_Subfield') },
    ], false),
    'The652_Subfield': o([
        { json: '3', js: '3', typ: r('Ambitious3') },
    ], false),
    'Ambitious3': o([
        { json: 'predicate', js: 'predicate', typ: '' },
        { json: 'object', js: 'object', typ: r('IndecentObject') },
        { json: 'relation', js: 'relation', typ: r('AmbitiousRelation') },
    ], false),
    'AmbitiousRelation': o([
        { json: 'subfield', js: 'subfield', typ: r('MagentaSubfield') },
        { json: 'class', js: 'class', typ: '' },
    ], false),
    'MagentaSubfield': o([
        { json: '1', js: '1', typ: r('TitleNumber') },
        { json: '3', js: '3', typ: r('TitleNumber') },
        { json: 'a', js: 'a', typ: r('FriskyA') },
    ], false),
    'FriskyA': o([
        { json: 'predicate', js: 'predicate', typ: '' },
        { json: 'object', js: 'object', typ: r('MagentaObject') },
    ], false),
    'MagentaObject': o([
        { json: 'datatype', js: 'datatype', typ: r('Datatype') },
        { json: 'lang', js: 'lang', typ: '' },
    ], false),
    'The695': o([
        { json: 'subfield', js: 'subfield', typ: r('The695_Subfield') },
    ], false),
    'The695_Subfield': o([
        { json: 'a', js: 'a', typ: r('MischievousA') },
    ], false),
    'MischievousA': o([
        { json: 'predicate', js: 'predicate', typ: '' },
        { json: 'object', js: 'object', typ: r('PurpleObject') },
        { json: 'relation', js: 'relation', typ: r('CunningRelation') },
    ], false),
    'CunningRelation': o([
        { json: 'subfield', js: 'subfield', typ: r('FriskySubfield') },
        { json: 'class', js: 'class', typ: '' },
    ], false),
    'FriskySubfield': o([
        { json: '1', js: '1', typ: r('TitleNumber') },
        { json: 'a', js: 'a', typ: r('FriskyA') },
    ], false),
    'The699': o([
        { json: 'subfield', js: 'subfield', typ: r('The699_Subfield') },
    ], false),
    'The699_Subfield': o([
        { json: 'a', js: 'a', typ: r('BraggadociousA') },
    ], false),
    'BraggadociousA': o([
        { json: 'predicate', js: 'predicate', typ: '' },
        { json: 'object', js: 'object', typ: r('AmbitiousObject') },
        { json: 'relation', js: 'relation', typ: r('TentacledRelation') },
    ], false),
    'The700': o([
        { json: 'subfield', js: 'subfield', typ: r('The700_Subfield') },
    ], false),
    'The700_Subfield': o([
        { json: '3', js: '3', typ: r('Cunning3') },
    ], false),
    'Cunning3': o([
        { json: 'conditions', js: 'conditions', typ: r('The3_Conditions') },
        { json: 'object', js: 'object', typ: r('IndecentObject') },
        { json: 'relation', js: 'relation', typ: r('PurpleRelation') },
    ], false),
    'The3_Conditions': o([
        { json: 'subfield', js: 'subfield', typ: r('MischievousSubfield') },
    ], false),
    'MischievousSubfield': o([
        { json: 'e', js: 'e', typ: r('FluffyE') },
    ], false),
    'FluffyE': o([
        { json: 'default', js: 'default', typ: '' },
        { json: 'subs', js: 'subs', typ: r('ESubs') },
        { json: 'orig', js: 'orig', typ: '' },
    ], false),
    'ESubs': o([
        { json: 'dir', js: 'dir', typ: '' },
        { json: 'komp', js: 'komp', typ: '' },
        { json: 'arr', js: 'arr', typ: '' },
        { json: 'foto', js: 'foto', typ: '' },
        { json: 'forf', js: 'forf', typ: '' },
        { json: 'biogr', js: 'biogr', typ: '' },
        { json: 'utøv', js: 'utøv', typ: '' },
        { json: 'innl', js: 'innl', typ: '' },
        { json: 'overs', js: 'overs', typ: '' },
        { json: 'k', js: 'k', typ: '' },
        { json: 'fort', js: 'fort', typ: '' },
        { json: 'medarb', js: 'medarb', typ: '' },
        { json: 'medforf', js: 'medforf', typ: '' },
        { json: 'gjendikt', js: 'gjendikt', typ: '' },
        { json: 'medf', js: 'medf', typ: '' },
        { json: 'utg', js: 'utg', typ: '' },
        { json: 'tekstf', js: 'tekstf', typ: '' },
        { json: 'komm', js: 'komm', typ: '' },
        { json: 'ill', js: 'ill', typ: '' },
        { json: 'oppl', js: 'oppl', typ: '' },
        { json: 'manusforf', js: 'manusforf', typ: '' },
        { json: 'sang', js: 'sang', typ: '' },
        { json: 'skuesp', js: 'skuesp', typ: '' },
        { json: 'u', js: 'u', typ: '' },
        { json: 't', js: 't', typ: '' },
        { json: 'bearb', js: 'bearb', typ: '' },
        { json: 'eks', js: 'eks', typ: '' },
        { json: 'reg', js: 'reg', typ: '' },
        { json: 'red', js: 'red', typ: '' },
    ], false),
    'The710': o([
        { json: 'subfield', js: 'subfield', typ: r('The710_Subfield') },
    ], false),
    'The710_Subfield': o([
        { json: '3', js: '3', typ: r('Magenta3') },
    ], false),
    'Magenta3': o([
        { json: 'predicate', js: 'predicate', typ: '' },
        { json: 'object', js: 'object', typ: r('IndecentObject') },
        { json: 'relation', js: 'relation', typ: r('MagentaRelation') },
    ], false),
    'MagentaRelation': o([
        { json: 'subfield', js: 'subfield', typ: r('BraggadociousSubfield') },
        { json: 'class', js: 'class', typ: '' },
    ], false),
    'BraggadociousSubfield': o([
        { json: '1', js: '1', typ: r('TitleNumber') },
        { json: '3', js: '3', typ: r('TitleNumber') },
        { json: 'a', js: 'a', typ: r('TitleNumber') },
    ], false),
    'The740': o([
        { json: 'subfield', js: 'subfield', typ: r('The740_Subfield') },
    ], false),
    'The740_Subfield': o([
        { json: 'a', js: 'a', typ: r('A1') },
    ], false),
    'A1': o([
        { json: 'object', js: 'object', typ: r('TitleNumberObject') },
        { json: 'conditions', js: 'conditions', typ: r('StickyConditions') },
    ], false),
    'StickyConditions': o([
        { json: 'indicator', js: 'indicator', typ: r('TentacledIndicator') },
    ], false),
    'TentacledIndicator': o([
        { json: 'default', js: 'default', typ: '' },
        { json: 'indicator2', js: 'indicator2', typ: r('Indicator1Class') },
    ], false),
    'The760': o([
        { json: 'subfield', js: 'subfield', typ: r('The760_Subfield') },
    ], false),
    'The760_Subfield': o([
        { json: 'w', js: 'w', typ: r('S') },
    ], false),
    'The856': o([
        { json: 'subfield', js: 'subfield', typ: r('The856_Subfield') },
    ], false),
    'The856_Subfield': o([
        { json: 'u', js: 'u', typ: r('UClass') },
    ], false),
    'The5032021467172737490929599': o([
        { json: 'subfield', js: 'subfield', typ: r('The5032021467172737490929599_Subfield') },
    ], false),
    'The5032021467172737490929599_Subfield': o([
        { json: 'a', js: 'a', typ: r('FriskyA') },
    ], false),
    'Datatype': [
        'literal',
        'uri',
    ],
    'RegexStrip': [
        '^.*?(?=http)',
        '[\\W]+',
    ],
    'Combinestring': [
        ' - ',
        '. ',
    ],
    'Class': [
        'FABIO.Work',
        'SKOS.Concept',
        'YAGO.LiteraryGenres',
    ],
}
