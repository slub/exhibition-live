import {JsonFormsCore} from '@jsonforms/core'
import {materialCells, materialRenderers} from '@jsonforms/material-renderers'
import {JsonForms} from '@jsonforms/react'
import Head from 'next/head'
import {useCallback, useState} from 'react'

import PerformanceFooter from '../components/layout/PerformanceFooter'
import PerformanceHeader from '../components/layout/PerformanceHeader'
import uischema from '../schema/exhibition-form-ui-schema.json'
import schema from '../schema/exhibition-info.schema.json'
import styles from '../styles/Home.module.css'


const exhibitionSchema = { ...schema, ...schema.$defs.Exhibition}

export default () => {
  const [data, setData] = useState({})


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
            <code>
              {JSON.stringify(data, null ,2)}
            </code>
            {/* Page footer */}
            <PerformanceFooter/>
          </div>
        </main>
      </>
  )
}
