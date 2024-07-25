import { run, subcommands } from "cmd-ts";
import { dataStore } from "./dataStore";
import { flatImportHandler } from "./flatImportHandler";
import { availableFlatMappings } from "@slub/exhibition-schema";
import { makeEdbCli } from "@slub/edb-cli-creator";

const cli = makeEdbCli(dataStore, [], availableFlatMappings, flatImportHandler);

run(
  subcommands({
    name: "edb-cli",
    version: "0.0.1",
    cmds: cli,
  }),
  process.argv.slice(2),
);
