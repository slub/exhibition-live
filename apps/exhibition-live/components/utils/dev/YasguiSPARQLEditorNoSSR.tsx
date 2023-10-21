import type Yasgui from '@triply/yasgui'
import dynamic from 'next/dynamic'

export interface YasguiSPARQLEditorProps {
  onInit?: (yasgu: Yasgui) => void
}
const DynamicComponentWithNoSSR = dynamic(() => import('./YasguiSPARQLEditor'), {
  ssr: false
})

// @ts-ignore
export default ( props: YasguiSPARQLEditorProps) => <DynamicComponentWithNoSSR {...props}/>
