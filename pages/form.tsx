import Head from 'next/head'
import {useState} from 'react'

import EditExhibitionJSONForm from '../components/form/EditExhibitionJSONForm'
import PerformanceFooter from '../components/layout/PerformanceFooter'
import PerformanceHeader from '../components/layout/PerformanceHeader'
import styles from '../styles/Home.module.css'


export default () => {
  const [data, setData] = useState({})


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
              <EditExhibitionJSONForm data={data} setData={_data => setData(_data)} />
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
