export const withEllipsis = (text: string | null | undefined, max: number) =>
  text ? (text.length > max ? `${text.slice(0, max)}…` : text) : "";
