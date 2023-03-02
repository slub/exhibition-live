import {MarkdownPreviewProps, MarkdownPreviewRef} from '@uiw/react-markdown-preview'
import {ContextStore, MDEditorProps} from '@uiw/react-md-editor'
import dynamic, {LoaderComponent} from 'next/dynamic'
import React from 'react'
/**
 * this dynamic import  is necessary due to https://github.com/uiwjs/react-md-editor/issues/52
 * @see https://err.sh/next.js/css-npm
 */
const MDEditor = dynamic(
  () => {
    const promise: Promise<React.ForwardRefExoticComponent<MDEditorProps & React.RefAttributes<ContextStore>> & { Markdown: React.ForwardRefExoticComponent<MarkdownPreviewProps & React.RefAttributes<MarkdownPreviewRef>> }> | LoaderComponent<MDEditorProps & React.RefAttributes<ContextStore>>
      = import('@uiw/react-md-editor').then((mod) => mod.default)
    return promise
  },
  { ssr: false }
)
export const MDEditorMarkdown = dynamic(
  () => {
    const promise: Promise<React.ForwardRefExoticComponent<MarkdownPreviewProps & React.RefAttributes<MarkdownPreviewRef>>>
      = import('@uiw/react-md-editor').then((mod) => mod.default.Markdown)
    return promise
  },
  { ssr: false }
)


export default MDEditor
