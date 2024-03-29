import { useState, MouseEvent, useMemo, useCallback } from "react";
import { Chip, Tooltip, Typography } from "@mui/material";
import NiceModal from "@ebay/nice-modal-react";
import { EntityDetailModal } from "../form/show/EntityDetailModal";

type OverflowContainerProps = {
  label: React.ReactNode;
  secondary?: React.ReactNode;
  entityIRI: string;
};

const OverflowText = ({ children }: { children: string }) => {
  return <Typography noWrap>{children}</Typography>;
};
export const OverflowChip = ({
  label,
  entityIRI,
  secondary,
}: OverflowContainerProps) => {
  const [tooltipEnabled, setTooltipEnabled] = useState(false);

  const showDetailModal = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      NiceModal.show(EntityDetailModal, { entityIRI, data: {} });
    },
    [entityIRI],
  );

  const handleShouldShow = useCallback(
    (e: MouseEvent<Element>) => {
      setTooltipEnabled(true);
    },
    [setTooltipEnabled],
  );

  return (
    <Tooltip
      title={secondary || label}
      open={tooltipEnabled}
      onClose={() => setTooltipEnabled(false)}
    >
      <Chip
        size={"small"}
        onMouseEnter={handleShouldShow}
        sx={{ maxWidth: "8em" }}
        label={label}
        onClick={showDetailModal}
      />
    </Tooltip>
  );
};
