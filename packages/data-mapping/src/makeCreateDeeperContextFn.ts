import { StrategyContext } from "./mappingStrategies";

/**
 * Create a logger for a specific path
 *
 * the logger will log to the console if disableLogging is false and will log the path before the message
 *
 * @param path
 * @param disableLogging
 */
export const createLogger = (path: string[], disableLogging: boolean) => ({
  log: (message: string) => {
    if (!disableLogging) {
      console.log(path.join("/"));
      console.log(`\t${message}`);
    }
  },
  warn: (message: string) => {
    if (!disableLogging) {
      console.warn(path.join("/"));
      console.warn(`\t${message}`);
    }
  },
  error: (message: string) => {
    if (!disableLogging) {
      console.error(message);
    }
  },
});

/**
 * Create a function to create a deeper context. A deeper context is a context with a longer path. Deep, because mapping
 * requires for recursive data mapping and entity generation.
 *
 * @param disableLogging
 */
export const makeCreateDeeperContextFn =
  (disableLogging: boolean) =>
  (context: StrategyContext, pathElement: string) => {
    const path = [...context.path, pathElement];
    return {
      ...context,
      path,
      logger: createLogger(path, disableLogging),
    };
  };
