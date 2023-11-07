import { ComponentMeta } from "@storybook/react";
import React from "react";

import LobidSearchTable from "./LobidSearchTable";

export default {
  title: "form/lobid/LobidSearchTable",
  component: LobidSearchTable,
} as ComponentMeta<typeof LobidSearchTable>;

export const LobidSearchTableDefault = () => (
  <LobidSearchTable searchString={"Ada Love"} />
);
