import Head from 'next/head'

import ContentHeader from '../components/content/ContentHeader'
import ContentMain from '../components/content/ContentMain'
import PerformanceFooter from '../components/layout/PerformanceFooter'
import PerformanceHeader from '../components/layout/PerformanceHeader'
import styles from '../styles/Home.module.css'

export default () => (
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
            <ContentHeader/>
            {/* Content area */}
            <ContentMain/>
          </div>
          {/* Page footer */}
          <PerformanceFooter/>
        </div>
      </main>
    </>
)
