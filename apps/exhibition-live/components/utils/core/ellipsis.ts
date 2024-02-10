export const ellipsis = (
  text: string | undefined | null,
  length: number,
  ellipsis: string = "…",
) => {
  if (!text) return "";
  if (text.length > length) {
    return text.substring(0, length - ellipsis.length) + ellipsis;
  }
  return text;
};
