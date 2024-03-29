import { leftpad } from "./leftpad";

describe("leftpad", () => {
  test("should pad a number with zeros to the specified length", () => {
    expect(leftpad(5, 3)).toBe("005");
    expect(leftpad(123, 5)).toBe("00123");
  });

  test("should pad a number with a specified character", () => {
    expect(leftpad(7, 4, "x")).toBe("xxx7");
    expect(leftpad(2021, 6, "1")).toBe("112021");
  });

  test("should return the number as a string if it already meets the specified length", () => {
    expect(leftpad(123, 3)).toBe("123");
    expect(leftpad(4567, 4, "0")).toBe("4567");
  });

  test("should throw an error if the number exceeds the specified length", () => {
    expect(() => leftpad(12345, 4)).toThrow(Error);
    expect(() => leftpad(123, 2)).toThrow(Error);
  });

  test("should handle zero correctly as an input number", () => {
    expect(leftpad(0, 3)).toBe("000");
    expect(leftpad(0, 4, "x")).toBe("xxx0");
  });

  test("should throw an error if the length is less than or equal to the length of the char parameter", () => {
    expect(() => leftpad(1, 1, "xx")).toThrow(Error);
    expect(() => leftpad(12, 2, "yyy")).toThrow(Error);
  });
});
