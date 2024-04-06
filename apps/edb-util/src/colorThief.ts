// @ts-ignore
import { getPaletteFromURL, getColorFromURL } from "color-thief-bun"
import {Elysia, t} from "elysia";
import {cors} from "@elysiajs/cors";
import {swagger} from "@elysiajs/swagger";

const app = new Elysia()
  .use(cors())
  .get("/color-palette", async ({query: {imageUrl}}) => {
    const decodedURI = decodeURIComponent(imageUrl);
    console.log(decodedURI)
    //const image = await downloadImage(decodedURI, "src/") as string
    //const absoluteImagePath = `${process.cwd()}/${image}`;
    //console.log(absoluteImagePath)
    return {
      palette: await getPaletteFromURL(decodedURI, 5),
      color: await  getColorFromURL(decodedURI)
    }
  }, {
    query: t.Object({
      imageUrl: t.String()
    })
  })
  .use(swagger())
  .listen(3001);

