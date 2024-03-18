import "@triply/yasgui/build/yasgui.min.css";

import Yasgui from "@triply/yasgui";
import React, { FunctionComponent, useEffect, useState } from "react";

import { exhibitionPrefixes } from "../../exhibtion";

interface OwnProps {
  onInit?: (yasgu: Yasgui) => void;
}

type Props = OwnProps;

const withPrefixes = (yg: Yasgui) => {
  const yasqe = yg.getTab(yg.persistentConfig.currentId())?.getYasqe();
  const yasqr = yg.getTab(yg.persistentConfig.currentId())?.getYasr();
  yasqe?.addPrefixes(exhibitionPrefixes);
  //yasqr?.set
  return yg;
};

const YasguiSPARQLEditor: FunctionComponent<Props> = ({ onInit }) => {
  const [yasgui, setYasgui] = useState<Yasgui | null>(null);

  useEffect(() => {
    setYasgui((yg) => {
      const el = document.getElementById("yasgui");
      return !el || yg
        ? yg
        : withPrefixes(
            new Yasgui(el, {
              yasqe: {
                queryingDisabled: undefined,
                showQueryButton: true,
              },
            }),
          );
    });
  }, [setYasgui]);
  useEffect(() => {
    if (yasgui && onInit) onInit(yasgui);
  }, [onInit, yasgui]);

  return <div id={"yasgui"} />;
};

export default YasguiSPARQLEditor;
