import Image, { ImageProps } from "next/image";
import { PUBLIC_BASE_PATH } from "../../config";
import { useEffect } from "react";

export const Img = ({ src, alt, ...rest }: ImageProps) => {
  useEffect(() => {
    console.log({PUBLIC_BASE_PATH, env: process.env});
  }, []);
  return (
    <Image
      src={`${PUBLIC_BASE_PATH}/${
        typeof src === "string" ? src : "Icons/no-image-placeholder.png"
      }`}
      alt={alt}
      {...rest}
    />
  );
};
