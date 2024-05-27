import { useSearchParams } from "react-router-dom";
import React, { useEffect, useMemo, useState } from "react";
import { decodeIRI } from "@slub/edb-core-utils";
import { MainLayout } from "../../components/layout/main-layout";
import { Button, Hidden } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import TypedForm from "../../components/content/main/TypedForm";
import {
  useAdbContext,
  useFormEditor,
  useModifiedRouter,
  useSettings,
} from "@slub/edb-state-hooks";
import NiceModal from "@ebay/nice-modal-react";

export const CreatePage = () => {
  const [searchParam] = useSearchParams();
  const {
    query: { typeName },
  } = useModifiedRouter();
  const { createEntityIRI, typeNameToTypeIRI } = useAdbContext();
  const [entityIRI, setEntityIRI] = useState(
    createEntityIRI(typeName as string),
  );
  useEffect(() => {
    const encID = searchParam.get("encID");
    const id = typeof encID === "string" ? decodeIRI(encID) : undefined;
    const newURI = id || createEntityIRI(typeName as string);
    setEntityIRI(newURI);
  }, [setEntityIRI, typeName, searchParam]);
  const { features } = useSettings();
  const { previewEnabled, togglePreview } = useFormEditor();
  const typeIRI: string | undefined = useMemo(
    () => typeNameToTypeIRI(typeName as string),
    [typeName],
  );

  return (
    <NiceModal.Provider>
      <MainLayout
        toolbar={
          <Hidden xsUp={!features?.enablePreview}>
            <Button
              onClick={() => togglePreview()}
              startIcon={previewEnabled ? <VisibilityOff /> : <Visibility />}
            >
              Vorschau {previewEnabled ? "ausblenden" : "einblenden"}
            </Button>
          </Hidden>
        }
      >
        {typeIRI && typeName && entityIRI && (
          <>
            <TypedForm
              key={entityIRI}
              entityIRI={entityIRI}
              typeName={typeName as string}
              classIRI={typeIRI}
            />
          </>
        )}
      </MainLayout>
    </NiceModal.Provider>
  );
};
