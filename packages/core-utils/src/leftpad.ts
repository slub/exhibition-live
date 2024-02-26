/**
 * convert a number to a string with a given length, pa it with a given char
 * @param number
 * @param length
 * @param char
 */
export const leftpad = (number: number, length: number, char: string = "0") => {
  let str = number.toString();
  if(char.length > length)
    throw new Error(`Char ${char} is too long for length ${length}`);
  if (str.length > length)
    throw new Error(`Number ${number} is too long for length ${length}`);
  while (str.length < length) str = char + str;
  return str;
};
