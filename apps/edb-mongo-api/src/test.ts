import { edenFetch } from "@elysiajs/eden";
import type { App } from "./index";
import { sladb, slent } from "./config";

const SERVER_URL = "http://localhost:3002";

const fetch = edenFetch<App>(SERVER_URL);

const catDogIRI = slent("xyz").value;
const typeName = "Animal";
const postExample = async () =>
  (
    await fetch("/document", {
      method: "POST",
      body: {
        typeName,
        entityIRI: slent("xyz").value,
        data: {
          "@id": catDogIRI,
          "@type": sladb(typeName).value,
          name: "Cat-Dog",
          description: "An hybrid animal resembling both a cat and a dog",
          birthDate: 19990102,
          rating: 3.0,
        },
      },
    })
  ).data;

const URL = `/document/${typeName}/${encodeURIComponent(catDogIRI)}`;
const getExample = async () => (await fetch(URL)).data;

console.log(SERVER_URL + URL);
console.log(JSON.stringify(await getExample(), null, 2));
