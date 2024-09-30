import { MainLayout } from "../../components/layout/main-layout";
import React from "react";
import NiceModal from "@ebay/nice-modal-react";
import { useModifiedRouter } from "@slub/edb-state-hooks";
import { SemanticTable } from "@slub/edb-table-components";
import { tableConfig } from "../../components/config/tableConfig";

export const ListPage = () => {
  const {
    query: { typeName },
  } = useModifiedRouter();
  return (
    <NiceModal.Provider>
      <MainLayout>
        {/* eslint-disable-next-line react/jsx-no-undef */}
        <SemanticTable
          typeName={typeName as string}
          tableConfigRegistry={tableConfig}
        />
      </MainLayout>
    </NiceModal.Provider>
  );
};
