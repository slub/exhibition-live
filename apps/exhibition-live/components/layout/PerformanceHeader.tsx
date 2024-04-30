import { Settings } from "@mui/icons-material";
import { Button, Grid } from "@mui/material";
import React, { FunctionComponent } from "react";

import SettingsModal from "../content/settings/SettingsModal";
import { useLocalSettings } from "../state/useLocalSettings";
import { Logo } from "./main-layout";

interface OwnProps {}

type Props = OwnProps;

const PerformanceHeader: FunctionComponent<Props> = (props) => {
  const { openSettings } = useLocalSettings();
  return (
    <>
      <header className="page-header">
        <Grid container justifyContent={"center"} sx={{ margin: "2em" }}>
          <Grid item>
            {/* Header logo */}
            <a className="logo" title="zur Homepage" href="#">
              <Logo />
            </a>
          </Grid>
        </Grid>
        <Grid container justifyContent={"flex-end"}>
          {/* Main navigation */}
          <Grid item>
            <Button startIcon={<Settings />} onClick={openSettings}></Button>
          </Grid>
        </Grid>
      </header>
      <SettingsModal />
    </>
  );
};

export default PerformanceHeader;
