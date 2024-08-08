import React from "react";

import LobidSearchTable from "./LobidSearchTable";
import { sladb } from "../../config/formConfigs";

export default {
  title: "ui/form/LobidSearchTable",
  component: LobidSearchTable,
};

export const LobidSearchTableDefault = () => (
  <LobidSearchTable typeIRI={sladb["Person"].value} searchString={"Ada Love"} />
);
