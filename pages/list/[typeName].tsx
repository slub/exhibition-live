import Head from 'next/head'
import {useRouter} from 'next/router'
import React from 'react'

import {sladb, slent} from '../../components/form/formConfigs'
import {MainLayout} from '../../components/layout/main-layout'
import {useRDFDataSources} from '../../components/state'

type Props = {
  children: React.ReactChild
  data: any
  classIRI: string
}
const classIRI = sladb.Exhibition.value
const exampleData = {
  '@id': slent['Exhibition#s-12'].value,
  '@type': classIRI,
  'title': 'Otto Dix Ausstellung'
}
export default () => {
  const {bulkLoaded} = useRDFDataSources('/ontology/exhibition-info.owl.ttl')
  const router = useRouter()
  const {typeName} = router.query

  return (
      <>
        <Head>
          <title>Ausstellungserfassung - {typeName}</title>
          <meta name="description" content="a knowledge base about exhibitions"/>
          <meta name="viewport" content="width=device-width, initial-scale=1"/>
          <link rel="icon" href="/favicon.ico"/>
        </Head>
        <MainLayout >
          List all {typeName} here.
        </MainLayout>
      </>
  )
}
