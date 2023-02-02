import {Box, Button} from '@mui/material'
import Head from 'next/head'
import {useCallback, useState} from 'react'
import {SplitPane} from 'react-collapse-pane'

import ContentMainPreview from '../components/content/ContentMainPreview'
import EditExhibitionJSONForm from '../components/form/EditExhibitionJSONForm'
import PerformanceFooter from '../components/layout/PerformanceFooter'
import PerformanceHeader from '../components/layout/PerformanceHeader'
import {useFormEditor} from '../components/state'
import styles from '../styles/Home.module.css'


const WithPreviewForm = ({ children }: { children: React.ReactChild}) => {
  const isLandscape = false
  const { previewEnabled, togglePreview,formData } = useFormEditor()


  return <>
    <Button onClick={() => togglePreview()} style={{zIndex: 100, position: 'absolute', left: '50%'}}  >Vorschau {previewEnabled ? 'ausblenden' : 'einblenden'}</Button>
    {previewEnabled
      ? <SplitPane split={isLandscape ? 'horizontal' : 'vertical'}>
        <div className={'page-wrapper'} style={{overflow: 'auto', height: '100%'}}>
            {children}
        </div>
        <div>
          {formData && <ContentMainPreview exhibition={formData} />}
        </div>
      </SplitPane>
      : <div className={'page-wrapper'}>{children}</div>}
  </>
}

export default () => {
  const [data, setData] = useState({})


  const handleSave = useCallback(
      () => {
      },
      [data])


  return (
      <>
        <Head>
          <title>Exhibition.Performance</title>
          <meta name="description" content="a knowledge base about exhibitions"/>
          <meta name="viewport" content="width=device-width, initial-scale=1"/>
          <link rel="icon" href="/favicon.ico"/>
        </Head>
        <main className={styles.main}>

          <WithPreviewForm  >
            <>
              {/* Page header */}
              <PerformanceHeader/>
              {/* Content wrapper */}
              <div className="default-wrapper">
                {/* Header area for content */}
                <EditExhibitionJSONForm data={data} setData={_data => setData(_data)}/>
                <Button onClick={handleSave} >speichern</Button>
              </div>
              {/* Page footer */}
              <PerformanceFooter/>
            </>
          </WithPreviewForm>
        </main>
      </>
  )
}
