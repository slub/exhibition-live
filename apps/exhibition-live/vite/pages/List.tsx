import { useModifiedRouter } from "../../components/basic";
import { MainLayout } from "../../components/layout/main-layout";
import { TypedList } from "../../components/content/list/TypedList";
import React from "react";
import NiceModal from "@ebay/nice-modal-react";

export const ListPage = () => {
  const {
    query: { typeName },
  } = useModifiedRouter();
  return (
    <NiceModal.Provider>
      <MainLayout>
        <TypedList typeName={typeName as string} />
      </MainLayout>
    </NiceModal.Provider>
  );
};
