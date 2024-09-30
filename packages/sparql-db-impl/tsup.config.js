import { makeConfigWithExternals } from "@slub/edb-tsup-config/tsup.config.js";
import pkg from "./package.json";

const config = makeConfigWithExternals(pkg);
export default config;
