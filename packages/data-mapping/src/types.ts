export type MappingOptions = {
  throwOnAttributeError?: boolean;
};

export type ProcessFlatResourceFn = (
  headerCallback: (header: string[]) => Promise<void>,
  recordCallback: (record: string[], index: number) => Promise<void>,
  amount?: number,
  offset?: number,
) => Promise<void>;
