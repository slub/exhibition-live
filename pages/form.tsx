import Head from 'next/head'
import React from 'react'

import MainFormNoSSR from '../components/content/main/MainFormNoSSR'
import PerformanceFooter from '../components/layout/PerformanceFooter'
import PerformanceHeader from '../components/layout/PerformanceHeader'
import {useRDFDataSources} from '../components/state'
import styles from '../styles/Home.module.css'

type Props = {
  children: React.ReactChild
  data: any
  classIRI: string
}
export default () => {
  const {bulkLoaded} = useRDFDataSources('./ontology/exhibition-info.owl.ttl')

  return (
      <>
        <Head>
          <title>Auststellungserfassung</title>
          <meta name="description" content="a knowledge base about exhibitions"/>
          <meta name="viewport" content="width=device-width, initial-scale=1"/>
          <link rel="icon" href="/favicon.ico"/>
        </Head>
        <PerformanceHeader/>
        <main className={styles.main}>
          {bulkLoaded && <MainFormNoSSR />}
        </main>
        <PerformanceFooter/>
      </>
  )
}
