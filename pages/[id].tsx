import Head from 'next/head'
import {useRouter} from 'next/router'
import React, {useMemo, useState} from 'react'

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
export default () => {
  const {bulkLoaded} = useRDFDataSources('./ontology/exhibition-info.owl.ttl')
  //get param id from nextjs router
  const router = useRouter()
  const {id} = router.query
  const startData = useMemo(() => (typeof id === 'string' ? {

    '@id': slent[id].value,
    '@type': classIRI,
    'title': ''
  } : {}), [id])

  return (
      <>
        <Head>
          <title>Ausstellungserfassung</title>
          <meta name="description" content="a knowledge base about exhibitions"/>
          <meta name="viewport" content="width=device-width, initial-scale=1"/>
          <link rel="icon" href="/favicon.ico"/>
        </Head>
        <PerformanceHeader/>
        <main className={styles.main} >
          {bulkLoaded && <MainFormNoSSR defaultData={startData}/>}
        </main>
        <PerformanceFooter/>
      </>
  )
}
