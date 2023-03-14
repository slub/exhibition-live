import Yasgui from '@triply/yasgui'
import React, {FunctionComponent, useCallback,useState} from 'react'

import SPARQLToolkit from './SPARQLToolkit'

interface OwnProps {
  sparqlQuery?: (query: string) => Promise<any>
}

type Props = OwnProps;

const SPARQLLocalOxigraphToolkit: FunctionComponent<Props> = ({sparqlQuery}) => {
  const [yasgui, setYasgui] = useState<Yasgui | null>(null)

  const handleSparqlQuery = useCallback(
      async () => {
        if (!yasgui || !sparqlQuery) return
        // @ts-ignore
        const yasqe = yasgui.getTab(0)?.getYasqe()
        // @ts-ignore
        const yasr = yasgui.getTab(0)?.getYasr()
        const query = yasqe?.getValueWithoutComments()
        if (!query) return
        const response = (await sparqlQuery(query))
        yasr?.setResponse(response)
      },
      [yasgui, sparqlQuery],
  )

  return (
      <SPARQLToolkit onInit={yg => setYasgui(yg)} onSendClicked={handleSparqlQuery}/>
  )
}

export default SPARQLLocalOxigraphToolkit
