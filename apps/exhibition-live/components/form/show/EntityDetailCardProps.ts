import { PrimaryFieldResults } from "../../utils/types";
import React from "react";
import { AllPropTableProps } from "../lobid/LobidAllPropTable";

type OwnProps = {
  typeIRI: string;
  entityIRI: string;
  cardInfo: PrimaryFieldResults<string>;
  cardActionChildren?: React.ReactNode;
  data: any;
  readonly?: boolean;
  inlineEditing?: boolean;
  onEditClicked?: () => void;
  tableProps?: Partial<AllPropTableProps>;
};

export type EntityDetailCardProps = OwnProps;
