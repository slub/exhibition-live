import dynamic from 'next/dynamic'

import type {SemanticJsonFormsProps} from './SemanticJsonForm'

const DynamicComponentWithNoSSR = dynamic(() => import('./SemanticJsonForm'), {
  ssr: false
})

// @ts-ignore
export default ( props: SemanticJsonFormsProps ) => <DynamicComponentWithNoSSR {...props}/>
