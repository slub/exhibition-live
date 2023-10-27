import {Meta} from "@storybook/react";
import React from "react";

import {MainLayout} from "./MainLayout";

export default {
  title: "layout/MainLayout",
  component: MainLayout,
} as Meta<typeof MainLayout>;

export const MainLayoutDefault = () => <MainLayout>content</MainLayout>;
