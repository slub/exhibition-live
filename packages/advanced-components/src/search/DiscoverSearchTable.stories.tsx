import React from "react";

import { DiscoverSearchTable } from "./DiscoverSearchTable";

export default {
  title: "ui/form/DiscoverSearchTable",
  component: DiscoverSearchTable,
};

export const DiscoverSearchTableDefault = () => (
  <DiscoverSearchTable typeName={"Person"} searchString={"Dix"} />
);
