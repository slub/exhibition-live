import { useMemo } from "react";
import { Link } from "@mui/material";

export const LabledLink = ({
  uri,
  label,
  onClick,
}: {
  uri: string;
  label?: string;
  onClick?: () => void;
}) => {
  const urlSuffix = useMemo(
    () =>
      uri.substring(
        uri.includes("#")
          ? uri.lastIndexOf("#")
          : uri.lastIndexOf("/") + 1 || 0,
        uri.length,
      ),
    [uri],
  );
  return (
    <Link target="_blank" href={uri}>
      {label || urlSuffix}
    </Link>
  );
};
