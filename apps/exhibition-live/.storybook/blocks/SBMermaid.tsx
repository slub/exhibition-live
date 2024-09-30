import React from "react";
import { Mermaid as MdxMermaid } from "mdx-mermaid/Mermaid";

export const SBMermaid = ({ chart }: { chart: string }) => {
  if (!chart) {
    return null;
  }
  return React.createElement(MdxMermaid, { chart });
};
