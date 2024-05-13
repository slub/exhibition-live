import { useState } from "react";
import { JsonForms } from "@jsonforms/react";
import {
  materialCells,
  materialRenderers,
} from "@jsonforms/material-renderers";
import { additionalRenderers } from "./additionalRenderer.ts";
import schema from "./schema.json";
import { Container } from "@mui/material";

const renderers = [...materialRenderers, ...additionalRenderers];

function App() {
  const [data, setData] = useState({ name: "Max", age: 142 });

  return (
    <Container>
      <JsonForms
        schema={schema}
        data={data}
        onChange={({ data: d }) => setData(d)}
        renderers={renderers}
        cells={materialCells}
      />
    </Container>
  );
}

export default App;
