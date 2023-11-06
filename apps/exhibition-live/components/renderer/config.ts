import React, { FunctionComponent } from "react";

export const shouldMemoize = false;

export const memo = <P extends object, T extends FunctionComponent<P>>(
  fn: T,
): React.NamedExoticComponent<P> | T => (shouldMemoize ? React.memo(fn) : fn);
