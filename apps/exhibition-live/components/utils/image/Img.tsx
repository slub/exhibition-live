import Image, { ImageProps } from "next/image";

const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
export const Img = ({ src, ...rest }: ImageProps) => {
  return <Image src={base + src} {...rest} />;
};
