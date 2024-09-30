import Image, { ImageProps } from "next/image";
import { PUBLIC_BASE_PATH } from "../config";

export const Img = ({ src, alt, ...rest }: ImageProps) => (
  <Image
    src={`${PUBLIC_BASE_PATH || ""}/${
      typeof src === "string" ? src : "Icons/no-image-placeholder.png"
    }`}
    alt={alt}
    {...rest}
  />
);
