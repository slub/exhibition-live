import { run, subcommands } from "cmd-ts";
import { dataStore, importStores } from "./dataStore";
import { flatImportHandler } from "./flatImportHandler";
import { availableFlatMappings } from "@slub/exhibition-schema";
import { makeEdbCli } from "@slub/edb-cli-creator";
import { schema } from "@slub/exhibition-schema";
import { seedHandler } from "./seedHandler";
import { mapFromAuthority } from "./mapFromAuthority";
import { authorityAccess } from "./auhtorityAccess";

const cli = makeEdbCli(
  schema,
  dataStore,
  importStores,
  availableFlatMappings,
  flatImportHandler,
  seedHandler,
  mapFromAuthority,
  authorityAccess,
);

run(
  subcommands({
    name: "edb-cli",
    version: "0.0.1",
    cmds: cli,
  }),
  process.argv.slice(2),
);
