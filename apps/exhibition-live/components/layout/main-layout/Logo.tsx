import { ImageProps } from "next/image";
import React from "react";

import { Img } from "../../utils/image/Img";

type OwnProps = {
  size?: number;
};

export type LogoProps = Partial<ImageProps> & OwnProps;
/**
 * this is tightly bound to the logo images original size, as next/Image does not allow to only specify a height without width, we have to do some calculation
 * later we should stick with something like fill={true} and a container, as a temporary workaround we use the size as scale factor
 * @param size scale factor size time the original dimensions
 * @param props
 * @constructor
 */
export const Logo = ({ size = 0.2, ...props }: LogoProps) => (
  <Img
    {...props}
    src={"/logo.png"}
    alt="Ausstellungsdatenbank"
    width={size * 589}
    height={size * 276}
  />
);
