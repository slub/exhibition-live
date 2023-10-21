import Head from 'next/head'
import {useSearchParams} from 'next/navigation'
import {useRouter} from 'next/router'
import React, {useMemo} from 'react'

import TypedForm from '../../components/content/main/TypedForm'
import {sladb, slent} from '../../components/form/formConfigs'
import {MainLayout} from '../../components/layout/main-layout'
import schema from '../../public/schema/Exhibition.schema.json'

type Props = {
  children: React.ReactChild
  data: any
  classIRI: string
}
export async function getStaticPaths() {
  const paths = Object.keys(schema.$defs ||  {}).map((typeName) => ({
    params: { typeName },
  }))

  return { paths, fallback: false }
}

export async function getStaticProps({ params }) {
  const typeName = params.typeName
  const classIRI = sladb[typeName].value
  return {
    props: {
      typeName
    }
  }
}
export default () => {
  const router = useRouter()
  const {typeName} = router.query as { typeName: string | null | undefined }
  //get query parm ?id=...
  //const {id: encodedID} = router.
  const searchParam = useSearchParams()
  const id = searchParam.get('id') as string | null | undefined

  const classIRI: string | undefined = typeof typeName === 'string' ? sladb(typeName).value : undefined
  const defaultData = useMemo(() => {
    return {
      '@id': slent[`${typeName}#s-12`].value || decodeURI(id),
      '@type': classIRI
    }

  }, [classIRI, typeName, id])

  return (
      <>
        <Head>
          <title>Neue {typeName} anlegen - Ausstellungserfassung</title>
          <meta name="description" content="a knowledge base about exhibitions"/>
          <meta name="viewport" content="width=device-width, initial-scale=1"/>
          <link rel="icon" href="/favicon.ico"/>
        </Head>
        <MainLayout >
          {classIRI && typeName && <TypedForm defaultData={defaultData} typeName={typeName} classIRI={classIRI}/>}
        </MainLayout>
      </>
  )
}
