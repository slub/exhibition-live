import { useQuery, UseQueryOptions } from '@tanstack/react-query'

import { useFetchData } from '../graphql/useFetchData'

export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: any;
  DateTime: any;
  GlobalID: any;
  JSON: any;
  UUID: any;
};

export type CorporationType = {
  __typename?: 'CorporationType';
  description?: Maybe<Scalars['String']>;
  id: Scalars['GlobalID'];
  imported?: Maybe<DataImportType>;
  name: Scalars['String'];
  nameVariants?: Maybe<Scalars['String']>;
  parent: CorporationType;
};

export type CreateImportPayload = DataImportType | OperationInfo;

export type CreatePersonPayload = OperationInfo | PersonType;

export type DataImportFilter = {
  status?: InputMaybe<StrFilterLookup>;
  uuid?: InputMaybe<UuidFilterLookup>;
};

export type DataImportInput = {
  importTime?: InputMaybe<Scalars['DateTime']>;
  remarks?: InputMaybe<Scalars['String']>;
  status?: InputMaybe<Scalars['String']>;
  uuid: Scalars['UUID'];
};

export type DataImportPartialInput = {
  id: Scalars['GlobalID'];
};

export type DataImportType = {
  __typename?: 'DataImportType';
  importTime: Scalars['DateTime'];
  remarks: Scalars['String'];
  status: Scalars['String'];
  uuid: Scalars['UUID'];
};

export type DataSourceType = {
  __typename?: 'DataSourceType';
  description?: Maybe<Scalars['String']>;
  id: Scalars['GlobalID'];
  title: Scalars['String'];
};

export type DeleteImportPayload = DataImportType | OperationInfo;

export type DeletePersonPayload = OperationInfo | PersonType;

export type EventTypeType = {
  __typename?: 'EventTypeType';
  description?: Maybe<Scalars['String']>;
  id: Scalars['GlobalID'];
  imported?: Maybe<DataImportType>;
  tags?: Maybe<Array<TagType>>;
  title: Scalars['String'];
};

export type ExhibitionCategoryType = {
  __typename?: 'ExhibitionCategoryType';
  description?: Maybe<Scalars['String']>;
  name: Scalars['String'];
};

export type ExhibitionFilter = {
  fromDate?: InputMaybe<IntFilterLookup>;
  id?: InputMaybe<GlobalIdFilterLookup>;
  search?: InputMaybe<Scalars['String']>;
  title?: InputMaybe<StrFilterLookup>;
  toDate?: InputMaybe<IntFilterLookup>;
};

export type ExhibitionObjectPersonType = {
  __typename?: 'ExhibitionObjectPersonType';
  exhibitionObject: ExhibitionObjectType;
  id: Scalars['GlobalID'];
  person: PersonType;
  role: RoleType;
};

export type ExhibitionObjectType = {
  __typename?: 'ExhibitionObjectType';
  dating?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  id: Scalars['GlobalID'];
  involvedPersons?: Maybe<Array<ExhibitionObjectPersonType>>;
  resources?: Maybe<Array<ResourceType>>;
  title: Scalars['String'];
};

export type ExhibitionSeriesType = {
  __typename?: 'ExhibitionSeriesType';
  description?: Maybe<Scalars['String']>;
  fromDate?: Maybe<Scalars['Int']>;
  fromType?: Maybe<Scalars['Int']>;
  id: Scalars['GlobalID'];
  openingDate?: Maybe<Scalars['Date']>;
  parent?: Maybe<ExhibitionSeriesType>;
  seriesType?: Maybe<SeriesTypeType>;
  tags?: Maybe<Array<TagType>>;
  title: Scalars['String'];
  toDate?: Maybe<Scalars['Int']>;
  toType?: Maybe<Scalars['Int']>;
};

export type ExhibitionType = {
  __typename?: 'ExhibitionType';
  description?: Maybe<Scalars['String']>;
  exhibitionCategory?: Maybe<ExhibitionCategoryType>;
  exhibitionObjects?: Maybe<Array<ExhibitionObjectType>>;
  exhibitionSeries?: Maybe<ExhibitionSeriesType>;
  exhibitionType: EventTypeType;
  externalId?: Maybe<Scalars['String']>;
  fromDate?: Maybe<Scalars['Int']>;
  fromDateDisplay?: Maybe<Scalars['String']>;
  fromType?: Maybe<Scalars['Int']>;
  id: Scalars['GlobalID'];
  imported?: Maybe<DataImportType>;
  involvedCorporations: Array<InvolvedCorporationType>;
  involvedPersons: Array<InvolvedPersonType>;
  locations?: Maybe<Array<LocationType>>;
  originalTitle?: Maybe<Scalars['String']>;
  otherDates: Array<OtherDateType>;
  places?: Maybe<Array<PlaceType>>;
  published: Scalars['Boolean'];
  resources?: Maybe<Array<ResourceType>>;
  source?: Maybe<DataSourceType>;
  subtitle?: Maybe<Scalars['String']>;
  tags?: Maybe<Array<TagType>>;
  title: Scalars['String'];
  toDate?: Maybe<Scalars['Int']>;
  toDateDisplay?: Maybe<Scalars['String']>;
  toType?: Maybe<Scalars['Int']>;
  weblink?: Maybe<Scalars['String']>;
};

export type GlobalIdFilterLookup = {
  contains?: InputMaybe<Scalars['GlobalID']>;
  endsWith?: InputMaybe<Scalars['GlobalID']>;
  exact?: InputMaybe<Scalars['GlobalID']>;
  gt?: InputMaybe<Scalars['GlobalID']>;
  gte?: InputMaybe<Scalars['GlobalID']>;
  iContains?: InputMaybe<Scalars['GlobalID']>;
  iEndsWith?: InputMaybe<Scalars['GlobalID']>;
  iExact?: InputMaybe<Scalars['GlobalID']>;
  iRegex?: InputMaybe<Scalars['String']>;
  iStartsWith?: InputMaybe<Scalars['GlobalID']>;
  inList?: InputMaybe<Array<Scalars['GlobalID']>>;
  isNull?: InputMaybe<Scalars['Boolean']>;
  lt?: InputMaybe<Scalars['GlobalID']>;
  lte?: InputMaybe<Scalars['GlobalID']>;
  range?: InputMaybe<Array<Scalars['GlobalID']>>;
  regex?: InputMaybe<Scalars['String']>;
  startsWith?: InputMaybe<Scalars['GlobalID']>;
};

export type IntFilterLookup = {
  contains?: InputMaybe<Scalars['Int']>;
  endsWith?: InputMaybe<Scalars['Int']>;
  exact?: InputMaybe<Scalars['Int']>;
  gt?: InputMaybe<Scalars['Int']>;
  gte?: InputMaybe<Scalars['Int']>;
  iContains?: InputMaybe<Scalars['Int']>;
  iEndsWith?: InputMaybe<Scalars['Int']>;
  iExact?: InputMaybe<Scalars['Int']>;
  iRegex?: InputMaybe<Scalars['String']>;
  iStartsWith?: InputMaybe<Scalars['Int']>;
  inList?: InputMaybe<Array<Scalars['Int']>>;
  isNull?: InputMaybe<Scalars['Boolean']>;
  lt?: InputMaybe<Scalars['Int']>;
  lte?: InputMaybe<Scalars['Int']>;
  range?: InputMaybe<Array<Scalars['Int']>>;
  regex?: InputMaybe<Scalars['String']>;
  startsWith?: InputMaybe<Scalars['Int']>;
};

export type InvolvedCorporationType = {
  __typename?: 'InvolvedCorporationType';
  corporation: CorporationType;
  exhibition: ExhibitionType;
  id: Scalars['GlobalID'];
  role: RoleType;
};

export type InvolvedPersonType = {
  __typename?: 'InvolvedPersonType';
  exhibition: ExhibitionType;
  id: Scalars['GlobalID'];
  person: PersonType;
  role: RoleType;
};

export type LocationType = {
  __typename?: 'LocationType';
  description?: Maybe<Scalars['String']>;
  geodata?: Maybe<Scalars['JSON']>;
  id: Scalars['GlobalID'];
  parent?: Maybe<LocationType>;
  title: Scalars['String'];
  titleVariants?: Maybe<Scalars['String']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createImport: CreateImportPayload;
  createPerson: CreatePersonPayload;
  deleteImport: DeleteImportPayload;
  deletePerson: DeletePersonPayload;
  updateImport: UpdateImportPayload;
  updatePerson: UpdatePersonPayload;
};


export type MutationCreateImportArgs = {
  input: DataImportInput;
};


export type MutationCreatePersonArgs = {
  input: PersonInput;
};


export type MutationDeleteImportArgs = {
  input: NodeInput;
};


export type MutationDeletePersonArgs = {
  input: NodeInput;
};


export type MutationUpdateImportArgs = {
  input: DataImportPartialInput;
};


export type MutationUpdatePersonArgs = {
  input: PersonPartialInput;
};

/** Input of an object that implements the `Node` interface. */
export type NodeInput = {
  id: Scalars['GlobalID'];
};

/** Multiple messages returned by an operation. */
export type OperationInfo = {
  __typename?: 'OperationInfo';
  /** List of messages returned by the operation. */
  messages: Array<OperationMessage>;
};

/** An error that happened while executing an operation. */
export type OperationMessage = {
  __typename?: 'OperationMessage';
  /** The field that caused the error, or `null` if it isn't associated with any particular field. */
  field?: Maybe<Scalars['String']>;
  /** The kind of this message. */
  kind: OperationMessageKind;
  /** The error message. */
  message: Scalars['String'];
};

/** The kind of the returned message. */
export enum OperationMessageKind {
  Error = 'ERROR',
  Info = 'INFO',
  Permission = 'PERMISSION',
  Validation = 'VALIDATION',
  Warning = 'WARNING'
}

export type OtherDateType = {
  __typename?: 'OtherDateType';
  dateType: Scalars['Int'];
  dateValue: Scalars['Date'];
  exhibition: ExhibitionType;
  id: Scalars['GlobalID'];
};

export type PersonFilter = {
  id?: InputMaybe<GlobalIdFilterLookup>;
  name?: InputMaybe<StrFilterLookup>;
  nameVariants?: InputMaybe<StrFilterLookup>;
  search?: InputMaybe<Scalars['String']>;
};

export type PersonInput = {
  cimport?: InputMaybe<DataImportInput>;
  description?: InputMaybe<Scalars['String']>;
  externalId?: InputMaybe<Scalars['String']>;
  gender?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
  nameVariants?: InputMaybe<Scalars['String']>;
  uimport?: InputMaybe<DataImportInput>;
};

export type PersonPartialInput = {
  id: Scalars['GlobalID'];
};

export type PersonType = {
  __typename?: 'PersonType';
  description?: Maybe<Scalars['String']>;
  externalId?: Maybe<Scalars['String']>;
  gender?: Maybe<Scalars['String']>;
  id: Scalars['GlobalID'];
  importedBy?: Maybe<DataImportType>;
  lastNormUpdate?: Maybe<Scalars['DateTime']>;
  memberOfCorp?: Maybe<Array<CorporationType>>;
  name: Scalars['String'];
  nameVariants?: Maybe<Scalars['String']>;
  normdata?: Maybe<Scalars['JSON']>;
};


export type PersonTypeImportedByArgs = {
  pk: Scalars['ID'];
};

export type PlaceType = {
  __typename?: 'PlaceType';
  description?: Maybe<Scalars['String']>;
  geodata?: Maybe<Scalars['JSON']>;
  id: Scalars['GlobalID'];
  imported?: Maybe<DataImportType>;
  location?: Maybe<LocationType>;
  parent?: Maybe<PlaceType>;
  title: Scalars['String'];
  titleVariants?: Maybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  getDataimport: DataImportType;
  getDataimports: Array<DataImportType>;
  getExhibition: ExhibitionType;
  getExhibitions: Array<ExhibitionType>;
  getPerson: PersonType;
  getPersons: Array<PersonType>;
};


export type QueryGetDataimportArgs = {
  pk: Scalars['ID'];
};


export type QueryGetDataimportsArgs = {
  filters?: InputMaybe<DataImportFilter>;
};


export type QueryGetExhibitionArgs = {
  pk: Scalars['ID'];
};


export type QueryGetExhibitionsArgs = {
  filters?: InputMaybe<ExhibitionFilter>;
};


export type QueryGetPersonArgs = {
  pk: Scalars['ID'];
};


export type QueryGetPersonsArgs = {
  filters?: InputMaybe<PersonFilter>;
};

export type ResourceType = {
  __typename?: 'ResourceType';
  corporation: CorporationType;
  description?: Maybe<Scalars['String']>;
  id: Scalars['GlobalID'];
  imported?: Maybe<DataImportType>;
  person: PersonType;
  ressourceType: RessourceTypeType;
  signature?: Maybe<Scalars['String']>;
  title: Scalars['String'];
  url?: Maybe<Scalars['String']>;
};

export type RessourceTypeType = {
  __typename?: 'RessourceTypeType';
  description?: Maybe<Scalars['String']>;
  id: Scalars['GlobalID'];
  title: Scalars['String'];
};

export type RoleType = {
  __typename?: 'RoleType';
  description?: Maybe<Scalars['String']>;
  id: Scalars['GlobalID'];
  roleType: Scalars['Int'];
  title: Scalars['String'];
};

export type SeriesTypeType = {
  __typename?: 'SeriesTypeType';
  description?: Maybe<Scalars['String']>;
  id: Scalars['GlobalID'];
  title: Scalars['String'];
};

export type StrFilterLookup = {
  contains?: InputMaybe<Scalars['String']>;
  endsWith?: InputMaybe<Scalars['String']>;
  exact?: InputMaybe<Scalars['String']>;
  gt?: InputMaybe<Scalars['String']>;
  gte?: InputMaybe<Scalars['String']>;
  iContains?: InputMaybe<Scalars['String']>;
  iEndsWith?: InputMaybe<Scalars['String']>;
  iExact?: InputMaybe<Scalars['String']>;
  iRegex?: InputMaybe<Scalars['String']>;
  iStartsWith?: InputMaybe<Scalars['String']>;
  inList?: InputMaybe<Array<Scalars['String']>>;
  isNull?: InputMaybe<Scalars['Boolean']>;
  lt?: InputMaybe<Scalars['String']>;
  lte?: InputMaybe<Scalars['String']>;
  range?: InputMaybe<Array<Scalars['String']>>;
  regex?: InputMaybe<Scalars['String']>;
  startsWith?: InputMaybe<Scalars['String']>;
};

export type TagType = {
  __typename?: 'TagType';
  description?: Maybe<Scalars['String']>;
  id: Scalars['GlobalID'];
  parent: TagType;
  title: Scalars['String'];
};

export type UuidFilterLookup = {
  contains?: InputMaybe<Scalars['UUID']>;
  endsWith?: InputMaybe<Scalars['UUID']>;
  exact?: InputMaybe<Scalars['UUID']>;
  gt?: InputMaybe<Scalars['UUID']>;
  gte?: InputMaybe<Scalars['UUID']>;
  iContains?: InputMaybe<Scalars['UUID']>;
  iEndsWith?: InputMaybe<Scalars['UUID']>;
  iExact?: InputMaybe<Scalars['UUID']>;
  iRegex?: InputMaybe<Scalars['String']>;
  iStartsWith?: InputMaybe<Scalars['UUID']>;
  inList?: InputMaybe<Array<Scalars['UUID']>>;
  isNull?: InputMaybe<Scalars['Boolean']>;
  lt?: InputMaybe<Scalars['UUID']>;
  lte?: InputMaybe<Scalars['UUID']>;
  range?: InputMaybe<Array<Scalars['UUID']>>;
  regex?: InputMaybe<Scalars['String']>;
  startsWith?: InputMaybe<Scalars['UUID']>;
};

export type UpdateImportPayload = DataImportType | OperationInfo;

export type UpdatePersonPayload = OperationInfo | PersonType;

export type AllExhibitionsQueryVariables = Exact<{ [key: string]: never; }>;


export type AllExhibitionsQuery = { __typename?: 'Query', getExhibitions: Array<{ __typename?: 'ExhibitionType', id: any, title: string, description?: string | null, fromDate?: number | null, toDate?: number | null, weblink?: string | null, places?: Array<{ __typename?: 'PlaceType', title: string, location?: { __typename?: 'LocationType', id: any, title: string } | null }> | null, locations?: Array<{ __typename?: 'LocationType', id: any, title: string }> | null }> };

export type SearchExhibitionsQueryVariables = Exact<{
  searchString?: InputMaybe<Scalars['String']>;
}>;


export type SearchExhibitionsQuery = { __typename?: 'Query', getExhibitions: Array<{ __typename?: 'ExhibitionType', id: any, title: string, description?: string | null, fromDate?: number | null, toDate?: number | null, weblink?: string | null, places?: Array<{ __typename?: 'PlaceType', title: string, location?: { __typename?: 'LocationType', id: any, title: string } | null }> | null, locations?: Array<{ __typename?: 'LocationType', id: any, title: string }> | null }> };

export type AllPersonsQueryVariables = Exact<{ [key: string]: never; }>;


export type AllPersonsQuery = { __typename?: 'Query', getPersons: Array<{ __typename?: 'PersonType', id: any, nameVariants?: string | null, name: string, description?: string | null, gender?: string | null, normdata?: any | null }> };


export const AllExhibitionsDocument = `
    query allExhibitions {
  getExhibitions {
    id
    title
    description
    fromDate
    toDate
    places {
      title
      location {
        id
        title
      }
    }
    locations {
      id
      title
    }
    weblink
  }
}
    `
export const useAllExhibitionsQuery = <
      TData = AllExhibitionsQuery,
      TError = unknown
    >(
      variables?: AllExhibitionsQueryVariables,
      options?: UseQueryOptions<AllExhibitionsQuery, TError, TData>
    ) =>
    useQuery<AllExhibitionsQuery, TError, TData>(
      variables === undefined ? ['allExhibitions'] : ['allExhibitions', variables],
      useFetchData<AllExhibitionsQuery, AllExhibitionsQueryVariables>(AllExhibitionsDocument).bind(null, variables),
      options
    )
export const SearchExhibitionsDocument = `
    query searchExhibitions($searchString: String) {
  getExhibitions(filters: {title: {iContains: $searchString}}) {
    id
    title
    description
    fromDate
    toDate
    places {
      title
      location {
        id
        title
      }
    }
    locations {
      id
      title
    }
    weblink
  }
}
    `
export const useSearchExhibitionsQuery = <
      TData = SearchExhibitionsQuery,
      TError = unknown
    >(
      variables?: SearchExhibitionsQueryVariables,
      options?: UseQueryOptions<SearchExhibitionsQuery, TError, TData>
    ) =>
    useQuery<SearchExhibitionsQuery, TError, TData>(
      variables === undefined ? ['searchExhibitions'] : ['searchExhibitions', variables],
      useFetchData<SearchExhibitionsQuery, SearchExhibitionsQueryVariables>(SearchExhibitionsDocument).bind(null, variables),
      options
    )
export const AllPersonsDocument = `
    query allPersons {
  getPersons {
    id
    nameVariants
    name
    description
    gender
    normdata
  }
}
    `
export const useAllPersonsQuery = <
      TData = AllPersonsQuery,
      TError = unknown
    >(
      variables?: AllPersonsQueryVariables,
      options?: UseQueryOptions<AllPersonsQuery, TError, TData>
    ) =>
    useQuery<AllPersonsQuery, TError, TData>(
      variables === undefined ? ['allPersons'] : ['allPersons', variables],
      useFetchData<AllPersonsQuery, AllPersonsQueryVariables>(AllPersonsDocument).bind(null, variables),
      options
    )