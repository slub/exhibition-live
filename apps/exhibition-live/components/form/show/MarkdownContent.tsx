import React, { useEffect } from "react";
import { useRemark } from "react-remark";
import { Container } from "@mui/material";
import rehypeDocument from "rehype-document";
import rehypeKatex from "rehype-katex";
import rehypeParse from "rehype-parse";
import rehypeStringify from "rehype-stringify";
import rehypeMermaid from "rehype-mermaid";
import remarkMath from "remark-math";
import rehypeVideo from "rehype-video";

export type MarkdownContentProps = {
  mdDocument: string;
};
const MarkdownContent = ({ mdDocument }: MarkdownContentProps) => {
  const [reactContent, setMarkdownSource] = useRemark({
    remarkPlugins: [remarkMath],
    rehypePlugins: [
    //  [rehypeParse as any, { fragment: true }],
      rehypeDocument as any,
      rehypeKatex as any,
      [
        rehypeVideo as any,
        {
          /**
           * URL suffix verification.
           * @default /\/(.*)(.mp4|.mov)$/
           */
          test: /\/(.*)(.mp4|.mov|.webm|.ogv)$/,
          /**
           * Support `<details>` tag to wrap <video>.
           * @default true
           */
          details: true,
        },
      ],
      [rehypeMermaid as any, { strategy: "img-svg" }],
      rehypeStringify as any,
    ],
  });

  useEffect(() => {
    setMarkdownSource(mdDocument);
  }, [mdDocument, setMarkdownSource]);

  return <Container>{reactContent}</Container>;
};

export default MarkdownContent;
