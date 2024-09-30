import type Yasgui from "@triply/yasgui";
import React, { FunctionComponent, useEffect, useState } from "react";

import { Prefixes } from "@slub/edb-core-types";
import { YasguiSPARQLEditorProps } from "./YasguiSPARQLEditorProps";

const withPrefixes = (yg: Yasgui, prefixes?: Prefixes) => {
  const yasqe = yg.getTab(yg.persistentConfig.currentId())?.getYasqe();
  const yasqr = yg.getTab(yg.persistentConfig.currentId())?.getYasr();
  prefixes && yasqe?.addPrefixes(prefixes);
  //yasqr?.set
  return yg;
};

const YasguiSPARQLEditor: FunctionComponent<YasguiSPARQLEditorProps> = ({
  onInit,
  prefixes,
}) => {
  const [yasgui, setYasgui] = useState<Yasgui | null>(null);

  useEffect(() => {
    import("@triply/yasgui").then(({ default: YasguiCls }) => {
      setYasgui((yg) => {
        const el = document.getElementById("yasgui");
        return !el || yg
          ? yg
          : withPrefixes(
              new YasguiCls(el, {
                yasqe: {
                  queryingDisabled: undefined,
                  showQueryButton: true,
                },
              }),
              prefixes,
            );
      });
    });
  }, [setYasgui]);
  useEffect(() => {
    if (yasgui && onInit) onInit(yasgui);
  }, [onInit, yasgui]);

  return <div id={"yasgui"} />;
};

export default YasguiSPARQLEditor;
