import { useState, MouseEvent } from "react";
import { Tooltip, Typography } from "@mui/material";

type OverflowContainerProps = {
  children: string;
};
export const OverflowContainer = ({ children }: OverflowContainerProps) => {
  const [tooltipEnabled, setTooltipEnabled] = useState(false);

  const handleShouldShow = ({ currentTarget }: MouseEvent<Element>) => {
    if (currentTarget.scrollWidth > currentTarget.clientWidth) {
      setTooltipEnabled(true);
    }
  };

  return (
    <Tooltip
      title={children}
      open={tooltipEnabled}
      onClose={() => setTooltipEnabled(false)}
    >
      <Typography onMouseEnter={handleShouldShow} noWrap>
        {children}
      </Typography>
    </Tooltip>
  );
};
