import { Meta } from "@storybook/react";
import React, { useMemo } from "react";

import { MainLayout } from "./MainLayout";
import TypedForm from "../../content/main/TypedFormNoSSR";
import { sladb, slent } from "../../form/formConfigs";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

export default {
  title: "layout/MainLayout",
  component: MainLayout,
} as Meta<typeof MainLayout>;

export const MainLayoutDefault = () => <MainLayout>content</MainLayout>;

const typeName = "Exhibition",
  classIRI: string | undefined = sladb(typeName).value,
  defaultData = {
    "@id": slent[`${typeName}#s-12`].value,
    "@type": classIRI,
  },
  queryClient = new QueryClient();
export const MainLayoutWithForm = () => (
  <QueryClientProvider client={queryClient}>
    <MainLayout>
      <TypedForm
        defaultData={defaultData}
        typeName={typeName}
        classIRI={classIRI}
      />
    </MainLayout>
  </QueryClientProvider>
);
