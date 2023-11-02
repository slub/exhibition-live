import { describe, expect, it } from "@jest/globals";
import {parseMarkdownLinks} from "./parseMarkdownLink";

describe('parseMarkdownLinks', () => {
  it('should parse a single markdown link', () => {
    const input = "[Google](https://www.google.com)";
    const expected = [{ label: 'Google', url: 'https://www.google.com' }];
    expect(parseMarkdownLinks(input)).toEqual(expected);
  });

  it('should parse multiple markdown links', () => {
    const input = "[Google](https://www.google.com); [OpenAI](https://www.openai.com);";
    const expected = [
      { label: 'Google', url: 'https://www.google.com' },
      { label: 'OpenAI', url: 'https://www.openai.com' }
    ];
    expect(parseMarkdownLinks(input)).toEqual(expected);
  });

  it('should return an empty array for no links', () => {
    const input = "No links here!";
    const expected: any[] = [];
    expect(parseMarkdownLinks(input)).toEqual(expected);
  });

  it('should ignore malformed links', () => {
    const input = "[Google](https://www.google.com); [Malformed](; [OpenAI](https://www.openai.com);";
    const expected = [
      { label: 'Google', url: 'https://www.google.com' }
    ];
    expect(parseMarkdownLinks(input)).toEqual(expected);
  });
});
