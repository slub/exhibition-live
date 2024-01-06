import { useState, MouseEvent, useCallback } from "react";
import { Tooltip, Typography } from "@mui/material";

type OverflowContainerProps = {
  children: string;
  tooltip?: string;
};
export const OverflowContainer = ({
  children,
  tooltip,
}: OverflowContainerProps) => {
  const [tooltipEnabled, setTooltipEnabled] = useState(false);

  const handleShouldShow = useCallback(
    ({ currentTarget }: MouseEvent<Element>) => {
      if (tooltip || currentTarget.scrollWidth > currentTarget.clientWidth) {
        setTooltipEnabled(true);
      }
    },
    [setTooltipEnabled, tooltip],
  );

  return (
    <Tooltip
      title={tooltip || children}
      open={tooltipEnabled}
      onClose={() => setTooltipEnabled(false)}
    >
      <Typography onMouseEnter={handleShouldShow} noWrap>
        {children}
      </Typography>
    </Tooltip>
  );
};
