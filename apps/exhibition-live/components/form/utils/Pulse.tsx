import React from "react";
import styled from "@emotion/styled";
import { Theme } from "@mui/material";

const pulsate = () => `
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
`;

const pulseRing = () => `
  0% {
    transform: scale(0.5);
  }
  80%, 100% {
    opacity: 0;
  }
`;

type PulsatingDotProps = {
  dotColor?: string;
  borderRadius?: string;
  boxHeight?: string;
  pulse?: boolean;
};

const PulsatingDot = styled.div<PulsatingDotProps>`
  animation: ${pulsate} 1.25s cubic-bezier(0.455, 0.03, 0.515, 0.955) -0.4s infinite;
  border-radius: ${({ borderRadius }) => borderRadius || "50%"};
  box-sizing: border-box;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;

  &:before {
    animation: pulseRing 1.25s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
    background-color: ${({ dotColor, theme }) =>
      dotColor || (theme as Theme).palette.primary.main};
    border-radius: ${({ borderRadius }) => borderRadius || "50%"};
    content: "";
    display: block;
    height: 300%;
    left: -100%;
    position: absolute;
    top: -100%;
    width: 300%;
  }

  @keyframes pulseRing {
    ${pulseRing}
  }
`;

export const Pulse = ({
  dotColor,
  borderRadius,
  boxHeight,
  pulse,
  children,
}: PulsatingDotProps & { children: React.ReactNode }) =>
  pulse ? (
    <PulsatingDot
      pulse={pulse}
      dotColor={dotColor}
      borderRadius={borderRadius}
      boxHeight={boxHeight}
    >
      {children}
    </PulsatingDot>
  ) : (
    <>{children}</>
  );
