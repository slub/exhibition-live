import { ComponentMeta } from "@storybook/react";
import React from "react";

import LobidSearchTable from "./LobidSearchTable";
import {sladb} from "../formConfigs";

export default {
  title: "form/lobid/LobidSearchTable",
  component: LobidSearchTable,
} as ComponentMeta<typeof LobidSearchTable>;

export const LobidSearchTableDefault = () => (
  <LobidSearchTable typeIRI={sladb["Person"].value} searchString={"Ada Love"} />
);
