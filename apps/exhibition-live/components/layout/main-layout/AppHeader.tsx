import { Menu as IconMenu } from "@mui/icons-material";
// material-ui
import { Avatar, Box, ButtonBase, useTheme } from "@mui/material";
import React, { useState } from "react";

import { Logo } from "./Logo";

const LogoSection = () => (
  <>
    <Logo />
  </>
);
const ProfileSection = () => <>ProfileSection</>;

export const AppHeader = () => {
  const theme = useTheme();

  return (
    <>
      {/* logo */}
      <Box
        sx={{
          width: 228,
          display: "flex",
          [theme.breakpoints.down("md")]: {
            width: "auto",
          },
        }}
      >
        <Box
          component="span"
          sx={{ display: { xs: "none", md: "block" }, flexGrow: 1 }}
        >
          <LogoSection />
        </Box>
      </Box>
    </>
  );
};
