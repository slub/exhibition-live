import { KnowledgeSources } from "@slub/edb-global-types";
import * as React from "react";
import { BasicThingInformation } from "@slub/edb-core-types";

export type SelectedEntity = {
  id: string;
  source: KnowledgeSources;
};
export type FindOptions = {
  limit?: number;
  page?: number;
  offset?: number;
  pageSize?: number;
};

export type ListItemRendererProps = {
  data: BasicThingInformation;
  idx: number;
  typeIRI: string;
  selected: boolean;
  onSelect?: (id: string, index: number) => void;
  onAccept?: (id: string, data: any) => void;
};
export type KnowledgeBaseDescription<T = any> = {
  id: KnowledgeSources;
  authorityIRI?: string;
  label: string;
  description: string;
  icon: string | React.ReactNode;
  find: (
    searchString: string,
    typeIRI: string,
    typeName: string,
    findOptions?: FindOptions,
  ) => Promise<T[]>;
  getEntity?: (id: string, typeIRI?: string) => Promise<any>;
  detailRenderer?: (id: string) => React.ReactNode;
  listItemRenderer?: (
    entry: any,
    idx: number,
    typeIRI: string,
    selected: boolean,
    onSelect?: (id: string, index: number) => void,
    onAccept?: (id: string, entry: any) => void,
  ) => React.ReactNode;
};
