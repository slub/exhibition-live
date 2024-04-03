import React, { useEffect } from "react";
import { useRemark } from "react-remark";
import { Container } from "@mui/material";

export type MarkdownContentProps = {
  mdDocument: string;
};
const MarkdownContent = ({ mdDocument }: MarkdownContentProps) => {
  const [reactContent, setMarkdownSource] = useRemark();

  useEffect(() => {
    setMarkdownSource(mdDocument);
  }, [mdDocument]);

  return <Container>{reactContent}</Container>;
};

export default MarkdownContent;
