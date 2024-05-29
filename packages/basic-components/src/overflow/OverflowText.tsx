import { Typography } from "@mui/material";

export const OverflowText = ({ children }: { children: string }) => {
  return <Typography noWrap>{children}</Typography>;
};
