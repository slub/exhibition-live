import { ToggleButton } from "@mui/lab";
import { Button } from "@mui/material";
import React, { FunctionComponent, useState } from "react";

import { YasguiSPARQLEditorNoSSR } from "./YasguiSPARQLEditorNoSSR";
import { useAdbContext } from "@slub/edb-state-hooks";

import { YasguiSPARQLEditorProps } from "./YasguiSPARQLEditorProps";

interface OwnProps {
  onSendClicked?: () => void;
}

type Props = OwnProps & YasguiSPARQLEditorProps;

export const SPARQLToolkit: FunctionComponent<Props> = ({
  onSendClicked,
  ...props
}) => {
  const [editorEnabled, setEditorEnabled] = useState(false);
  const {
    queryBuildOptions: { prefixes },
  } = useAdbContext();
  return (
    <>
      {editorEnabled ? (
        <>
          <YasguiSPARQLEditorNoSSR {...props} prefixes={prefixes} />
          <Button onClick={() => onSendClicked && onSendClicked()}>
            query
          </Button>
        </>
      ) : null}
      <ToggleButton
        value={editorEnabled}
        onClick={() => setEditorEnabled((e) => !e)}
      >
        sparql
      </ToggleButton>
    </>
  );
};
