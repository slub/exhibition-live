import { useState, MouseEvent, useMemo, useCallback } from "react";
import { Chip, Tooltip, Typography } from "@mui/material";
import NiceModal from "@ebay/nice-modal-react";
import { LoadedEntityDetailModal } from "../form/show/LoadedEntityDetailModal";

type OverflowContainerProps = {
  label: string;
  entityIRI: string;
};

const OverflowText = ({ children }: { children: string }) => {
  return <Typography noWrap>{children}</Typography>;
};
export const OverflowChip = ({ label, entityIRI }: OverflowContainerProps) => {
  const [tooltipEnabled, setTooltipEnabled] = useState(false);

  const showDetailModal = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      NiceModal.show(LoadedEntityDetailModal, { entityIRI, data: {} });
    },
    [entityIRI],
  );

  const handleShouldShow = useCallback(
    (e: MouseEvent<Element>) => {
      setTooltipEnabled(true);
    },
    [setTooltipEnabled, showDetailModal],
  );

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
        onClick={showDetailModal}
      />
    </Tooltip>
  );
};
