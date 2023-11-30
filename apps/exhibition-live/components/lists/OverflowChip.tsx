import { useState, MouseEvent } from "react";
import { Chip, Tooltip, Typography } from "@mui/material";

type OverflowContainerProps = {
  label: string;
};

const OverflowText = ({ children }: { children: string }) => {
  return <Typography noWrap>{children}</Typography>;
};
export const OverflowChip = ({ label }: OverflowContainerProps) => {
  const [tooltipEnabled, setTooltipEnabled] = useState(false);

  const handleShouldShow = ({ currentTarget }: MouseEvent<Element>) => {
    setTooltipEnabled(true);
  };

  return (
    <Tooltip
      title={label}
      open={tooltipEnabled}
      onClose={() => setTooltipEnabled(false)}
    >
      <Chip
        size={"small"}
        onMouseEnter={handleShouldShow}
        sx={{ maxWidth: "8em" }}
        label={label}
      />
    </Tooltip>
  );
};
