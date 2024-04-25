import { Head, Html, Main, NextScript } from "next/document";
import { concertOne, lato } from "../components/state";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body data-color-mode="light">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
