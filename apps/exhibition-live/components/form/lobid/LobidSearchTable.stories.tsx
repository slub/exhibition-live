import React from "react";

import LobidSearchTable from "./LobidSearchTable";
import { sladb } from "../formConfigs";

export default {
  title: "form/lobid/LobidSearchTable",
  component: LobidSearchTable,
};

export const LobidSearchTableDefault = () => (
  <LobidSearchTable typeIRI={sladb["Person"].value} searchString={"Ada Love"} />
);
