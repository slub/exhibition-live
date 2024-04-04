import React, { useState, MouseEvent, useCallback } from "react";
import { Tooltip, Typography, TypographyOwnProps } from "@mui/material";

type OverflowContainerProps = {
  children: React.ReactNode;
  tooltip?: React.ReactNode;
  density?: "comfortable" | "compact" | "spacious";
  useParentTarget?: boolean;
};
export const OverflowContainer = ({
  children,
  tooltip,
  useParentTarget,
  density,
  ...props
}: OverflowContainerProps & Partial<TypographyOwnProps>) => {
  const [tooltipEnabled, setTooltipEnabled] = useState(false);

  const handleShouldShow = useCallback(
    ({ currentTarget }: MouseEvent<Element>) => {
      const cTarget = useParentTarget
        ? currentTarget.parentElement
        : currentTarget;
      if (
        tooltip ||
        (density === "spacious"
          ? cTarget.scrollHeight > cTarget.clientHeight
          : cTarget.scrollWidth > cTarget.clientWidth)
      ) {
        setTooltipEnabled(true);
      }
    },
    [setTooltipEnabled, tooltip, density, useParentTarget],
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
