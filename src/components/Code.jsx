import { useRef } from 'react'
import Editor from '@monaco-editor/react'
import { useTranslation } from 'react-i18next'

import { DEFAULT_CODE, EDITOR_OPTIONS, IS_IFRAME, language } from '../consts'
import { getCodeFromURL } from '../core/encode'

import Button from './Button'
import Report from './Report'

import { IconDownload, IconFormat } from './Icons'
import Upload from './Upload'

let throttlePause
const throttle = (callback, time) => {
  if (throttlePause) return
  throttlePause = true
  setTimeout(() => {
    callback()
    throttlePause = false
  }, time)
}

export default function Code ({ onChange }) {
  const editorRef = useRef(null)
  const { t } = useTranslation()

  function handleChange () {
    if (!editorRef.current) return
    const editor = editorRef.current
    const code = editor.getValue()
    onChange({ code, language })
  }

  function onMount (editor, monaco) {
    editorRef.current = editor

    editor.focus()

    handleChange()
  }

  function handleEditorChange () {
    throttle(handleChange, 800)
  }

  function formatDocument () {
    const editor = editorRef.current
    editor.getAction('editor.action.formatDocument').run()
  }

  function downloadCode () {
    const editor = editorRef.current
    const code = editor.getValue()
    const blob = new window.Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = 'playjs.' + (language === 'javascript' ? 'js' : 'ts')
    link.href = url
    link.click()
  }

  return (
    <div>
      <Editor
        className='pt-4'
        language={language}
        theme='vs-dark'
        defaultValue={getCodeFromURL() || DEFAULT_CODE}
        onMount={onMount}
        onChange={handleEditorChange}
        loading=''
        options={{
          ...EDITOR_OPTIONS,
          lineNumbers: 'on'
        }}
      />
      <div className='fixed bottom-0 left-2 z-10 p-3 flex gap-4'>
        {!IS_IFRAME && (
          <Button
            onClick={formatDocument}
            title={t('code.formatTitle')}
          >
            <IconFormat />
            <span className='hidden sm:block'>{t('code.format')}</span>
          </Button>
        )}
        <Button
          onClick={downloadCode}
          title={t('code.downloadTitle')}
        >
          <IconDownload />
          {!IS_IFRAME && (
            <span className='hidden sm:block'>{t('code.download')}</span>
          )}
        </Button>
        <Upload editor={editorRef.current} />
        <Report />
      </div>
    </div>
  )
}
