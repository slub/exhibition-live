import {ToggleButton} from '@mui/lab'
import {Button} from '@mui/material'
import React, {FunctionComponent, useState} from 'react'

import YasguiSPARQLEditorNoSSR, {YasguiSPARQLEditorProps} from './YasguiSPARQLEditorNoSSR'

interface OwnProps {
  onSendClicked?: () => void
}

type Props = OwnProps & YasguiSPARQLEditorProps;

const SPARQLToolkit: FunctionComponent<Props> = ({onSendClicked, ...props}) => {
  const [editorEnabled, setEditorEnabled] = useState(false)
  return <>{
    (editorEnabled ? <>
      <YasguiSPARQLEditorNoSSR {...props} />
      <Button onClick={() => onSendClicked && onSendClicked()}>query</Button>
    </> : null)}
    <ToggleButton value={editorEnabled}  onClick={() => setEditorEnabled(e => !e)}>sparql</ToggleButton>
  </>
}

export default SPARQLToolkit
