import dynamic from 'next/dynamic'

import type {MainFormProps} from './MainForm'

const DynamicComponentWithNoSSR = dynamic(() => import('./MainForm'), {
  ssr: false
})

// @ts-ignore
export default ( props: MainFormProps ) => <DynamicComponentWithNoSSR {...props}/>
