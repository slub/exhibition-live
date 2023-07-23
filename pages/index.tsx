import Head from 'next/head'
import React, {useState} from 'react'

import MainFormNoSSR from '../components/content/main/MainFormNoSSR'
import {sladb, slent} from '../components/form/formConfigs'
import PerformanceFooter from '../components/layout/PerformanceFooter'
import PerformanceHeader from '../components/layout/PerformanceHeader'
import {useRDFDataSources} from '../components/state'
import styles from '../styles/Home.module.css'

type Props = {
  children: React.ReactChild
  data: any
  classIRI: string
}
const classIRI = sladb.Exhibition.value
const exampleData = {
  '@id': slent['Exhibition#s-1'].value,
  '@type': classIRI,
  'title': 'Otto Dix Ausstellung'
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
          {bulkLoaded && <MainFormNoSSR defaultData={exampleData}/>}
        </main>
        <PerformanceFooter/>
      </>
  )
}
