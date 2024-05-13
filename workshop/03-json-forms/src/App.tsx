import { useState } from "react";
import { JsonForms } from "@jsonforms/react";
import { vanillaCells, vanillaRenderers } from "@jsonforms/vanilla-renderers";
import { additionalRenderers } from "./additionalRenderer.ts";
import schema from "./schema.json";
import { Container } from "@mui/material";

const renderers = [...vanillaRenderers, ...additionalRenderers];

function App() {
  const [data, setData] = useState({ name: "Max", age: 42 });

  return (
    <Container>
      <JsonForms
        schema={schema}
        data={data}
        onChange={({ data: d }) => setData(d)}
        renderers={renderers}
        cells={vanillaCells}
      />
    </Container>
  );
}

export default App;
