import React from "react";
import { createPortal } from "react-dom";

export const optionallyCreatePortal = (
  children: React.ReactNode,
  container?: HTMLElement,
) => (container ? createPortal(children, container) : children);
