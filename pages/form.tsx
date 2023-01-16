import Head from "next/head";
import PerformanceHeader from "../components/layout/PerformanceHeader";
import PerformanceFooter from "../components/layout/PerformanceFooter";
import {materialCells, materialRenderers} from '@jsonforms/material-renderers'
import {JsonForms} from "@jsonforms/react";
import {useCallback, useState} from "react";
import styles from '../styles/Home.module.css'
import {JsonFormsCore} from "@jsonforms/core";
import schema from "../schema/exhibition-info.schema.json"
import uischema from "../schema/exhibition-form-ui-schema.json"
import {Box, Chip} from "@mui/material";
import WikidataAutoCompleteInput from "../components/form/wikidata/WikidataAutoCompleteInput";
import GNDAutocompleteInput from "../components/form/gnd/GNDAutocompleteInput";


const exhibitionSchema = { ...schema, ...schema.$defs.Exhibition}

export default () => {
  const [data, setData] = useState({});
  const [selected, setSelected] = useState<string | null>(null);


  const handleFormChange = useCallback(
      (state: Pick<JsonFormsCore, 'data' | 'errors'>) => {
        setData(state.data)
      }, [setData])

  return (
      <>
        <Head>
          <title>Exhibition.Performance</title>
          <meta name="description" content="a knowledge base about exhibitions"/>
          <meta name="viewport" content="width=device-width, initial-scale=1"/>
          <link rel="icon" href="/favicon.ico"/>
        </Head>
        <main className={styles.main}>
          <div className="page-wrapper">
            {/* Page header */}
            <PerformanceHeader/>
            {/* Content wrapper */}
            <div className="default-wrapper">
              {/* Header area for content */}
              <JsonForms
                  data={data}
                  renderers={materialRenderers}
                  cells={materialCells}
                  onChange={handleFormChange}
                  schema={exhibitionSchema}
                  uischema={uischema}
              />
            </div>
            <div>
              <GNDAutocompleteInput />
            </div>
            <div>
              <WikidataAutoCompleteInput />
            </div>
            {selected && (
                <Box m={1}>
                  <Chip  label={selected} />
                </Box>
            )}
            <code>
              {JSON.stringify(data, null ,2)}
            </code>
            {/* Page footer */}
            <PerformanceFooter/>
          </div>
        </main>
      </>
  );
}
