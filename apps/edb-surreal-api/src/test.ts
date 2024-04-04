import { edenFetch } from "@elysiajs/eden";
import type { App } from "./index";
import { argv } from "bun";

const SERVER_URL = "http://localhost:3002";

const fetch = edenFetch<App>(SERVER_URL);

const typeName = argv[2];
const id = argv[3];

console.log(id);
console.log(
  JSON.stringify(
    !id || id.length === 0
      ? !typeName || typeName.length === 0
        ? await fetch(`/importAll`, { method: "PUT" })
        : await fetch(`/importAll/${typeName}`, { method: "PUT" })
      : (
          await fetch(`/import/${typeName}/${encodeURIComponent(id)}`, {
            method: "PUT",
          })
        ).data,
    null,
    2,
  ),
);
