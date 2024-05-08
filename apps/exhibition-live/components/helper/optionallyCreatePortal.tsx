import React from "react";
import { createPortal } from "react-dom";

export const optionallyCreatePortal = (
  children: React.ReactNode,
  container?: HTMLElement,
  // @ts-ignore
) => (container ? createPortal(children, container) : children);
