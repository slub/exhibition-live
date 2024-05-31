import { Meta } from "@storybook/react";
import React, { useMemo } from "react";

import { MainLayout } from "./MainLayout";
import TypedForm from "../../content/main/TypedFormNoSSR";
import { sladb, slent } from "../../config/formConfigs";
import { QueryClientProvider, QueryClient } from "@slub/edb-state-hooks";

export default {
  title: "layout/MainLayout",
  component: MainLayout,
} as Meta<typeof MainLayout>;

export const MainLayoutDefault = () => <MainLayout>content</MainLayout>;

const typeName = "Exhibition",
  classIRI: string | undefined = sladb(typeName).value,
  queryClient = new QueryClient();
export const MainLayoutWithForm = () => (
  <QueryClientProvider client={queryClient}>
    <MainLayout>
      <TypedForm
        entityIRI={slent.example.value}
        typeName={typeName}
        classIRI={classIRI}
      />
    </MainLayout>
  </QueryClientProvider>
);
