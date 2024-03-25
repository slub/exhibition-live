import React, { useState, MouseEvent, useCallback } from "react";
import {Tooltip, Typography, TypographyOwnProps} from "@mui/material";

type OverflowContainerProps = {
  children: React.ReactNode;
  tooltip?: React.ReactNode;
  density?:  'comfortable' | 'compact' | 'spacious';
};
export const OverflowContainer = ({
  children,
  tooltip,
  density,
  ...props
}: OverflowContainerProps & Partial<TypographyOwnProps>) => {
  const [tooltipEnabled, setTooltipEnabled] = useState(false);

  const handleShouldShow = useCallback(
    ({ currentTarget }: MouseEvent<Element>) => {
      if (tooltip || (density === "spacious" ? currentTarget.scrollHeight > currentTarget.clientHeight :  currentTarget.scrollWidth > currentTarget.clientWidth)) {
        setTooltipEnabled(true);
      }
    },
    [setTooltipEnabled, tooltip, density],
  );

  return (
    <Tooltip
      title={tooltip || children}
      open={tooltipEnabled}
      onClose={() => setTooltipEnabled(false)}
    >
      <Typography
        sx={{
          overflow: "hidden",
          maxHeight: "10rem",
        }}
        onMouseEnter={handleShouldShow}
        noWrap={density !== "spacious"}
        {...props}
      >
        {children}
      </Typography>
    </Tooltip>
  );
};
