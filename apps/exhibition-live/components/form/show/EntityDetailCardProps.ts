import React from "react";
import { AllPropTableProps } from "../lobid/LobidAllPropTable";
import { PrimaryFieldResults } from "@slub/edb-core-types";

type OwnProps = {
  typeIRI: string;
  entityIRI: string;
  cardInfo: PrimaryFieldResults<string>;
  cardActionChildren?: React.ReactNode;
  data: any;
  readonly?: boolean;
  disableInlineEditing?: boolean;
  onEditClicked?: () => void;
  tableProps?: Partial<AllPropTableProps>;
};

export type EntityDetailCardProps = OwnProps;
