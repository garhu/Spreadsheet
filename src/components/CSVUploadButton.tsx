import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import CSV from '../models/CSV'
import { ISheet } from '../models/Sheet'

const reader = new FileReader()

type Props = {
  onUpload: (sheet: ISheet) => void
  children: (onClick: () => void) => React.ReactNode
}

export const CSVUploadButton: React.FC<Props> = ({ onUpload, children }) => {
  const [csvFile, setCsvFile] = useState()
  const csvInputRef = useRef<HTMLInputElement>(null)

  // when csv file gets submitted, add a new sheet with the content
  useEffect(() => {
    if (csvFile) {
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const text = e.target?.result?.toString()
        //@ts-ignore
        let name = csvFile.name
        name = name.substring(0, name.length - 4)
        // const name = e.target?.result?.name?
        if (text) {
          const newSheet = CSV.import(text, name)
          onUpload(newSheet)
          toast('Imported CSV available in new sheet')
        } else {
          console.log('error processing csv')
          toast('Error importing CSV')
        }
      }

      reader.readAsText(csvFile)
      setCsvFile(undefined)
    }
  }, [csvFile])

  // clear file value on click
  const onClick = () => {
    if (csvInputRef.current) {
      csvInputRef.current.value = ''
      csvInputRef.current.click()
    }
  }

  return (
    <>
      <input
        type="file"
        accept=".csv"
        id="csvFile"
        onChange={(e: any) => {
          setCsvFile(e.target.files[0])
        }}
        style={{ display: 'none' }} // don't visually render this file input
        ref={csvInputRef}
      />
      {children(onClick)}
    </>
  )
}
