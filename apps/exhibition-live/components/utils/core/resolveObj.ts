export const resolveObj = (obj: any, path: string, defaultValue?: any) =>
  path.split(".").reduce((o, p) => o && o[p], obj) || defaultValue;
