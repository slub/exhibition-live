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

type AppHeaderProps = {
  onLeftDrawerToggle: () => void;
};
export const AppHeader = ({ onLeftDrawerToggle }: AppHeaderProps) => {
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
        <ButtonBase sx={{ borderRadius: "12px", overflow: "hidden" }}>
          <Avatar
            variant="rounded"
            sx={{
              // @ts-ignore
              ...theme.typography.commonAvatar,
              // @ts-ignore
              ...theme.typography.mediumAvatar,
              transition: "all .2s ease-in-out",
              background: theme.palette.secondary.light,
              color: theme.palette.secondary.dark,
              stroke: 1.5,
              "&:hover": {
                background: theme.palette.secondary.dark,
                color: theme.palette.secondary.light,
              },
            }}
            onClick={onLeftDrawerToggle}
            color="inherit"
          >
            <IconMenu />
          </Avatar>
        </ButtonBase>
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
