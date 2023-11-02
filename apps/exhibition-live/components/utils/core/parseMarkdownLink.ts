export type MarkdownLink = {
  label: string;
  url: string;
};

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
}

export function parseMarkdownLinks(input: string): MarkdownLink[] {
  const regex = /\[([^\]]+?)\]\(([^\)]+?)\)/g; // Make the regex non-greedy by adding '?' after '+'

  let match;
  const links: MarkdownLink[] = [];

  while ((match = regex.exec(input)) !== null) {
    if (match[2] && isValidUrl(match[2])) {
      links.push({
        label: match[1],
        url: match[2],
      });
    }
  }
  return links;
}
