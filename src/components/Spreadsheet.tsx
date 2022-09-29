import React, { useEffect, useState, useRef } from 'react'
import { ISpreadsheet } from '../models/Spreadsheet'
import Sheet from './Sheet'
import Button from './Button'
import styled from 'styled-components'
import ToolBarMenu from './ToolBarMenu'
import SheetTabs from './SheetTabs'
import { ContextMenu, ContextMenuItem } from './ContextMenu'
import { ChartCreationModal } from './ChartCreationModal'
import CSV from '../models/CSV'
import { CSVUploadButton } from './CSVUploadButton'
import { RightDrawer } from './RightDrawer'
import { ISheet } from '../models/Sheet'
import { RenameSheetModal } from './RenameSheetModal'

const TopToolBar = styled.div`
  position: fixed;
  width: 100%;
  top: 0px;
  left: 0px;
  background-color: gray;
  font-size: 20px;
  display: flex;
  align-items: center;
  height: 35px;
`

type SpreadSheetProps = {
  spreadsheet: ISpreadsheet
}

/**
 * Render the entire spreadsheet. Users are limited to one spreadsheet.
 */
const Spreadsheet: React.FC<SpreadSheetProps> = ({ spreadsheet }) => {
  const ref1 = useRef<HTMLDivElement>(null)
  const ref2 = useRef<HTMLDivElement>(null)

  // open/closed state for each of the three utility buttons at the top of the app
  const [toolBarMenuStatusList, setToolBarMenuStatus] = useState([false, false])

  const [activeSheet, setActiveSheet] = useState(0)
  const [reorderToggle, setReorderToggle] = useState(true) // flip back and forth upon reorder to force a rerender
  const [numSheets, setNumSheets] = useState(spreadsheet.getSheets().length)
  const [isChartModalOpen, setIsChartModalOpen] = useState(false)
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false)
  const [sheetIdCounter, setSheetIdCounter] = useState(
    spreadsheet.getSheets().length
  )
  const names = spreadsheet.getSheets().map((s) => s.getName())
  const [tabOrder, setTabOrder] = useState(names) // list of the sheet names for tab reordering

  const currentSheet = spreadsheet.getSheets()[activeSheet]

  const closeToolbarMenu = () => setToolBarMenuStatus([false, false])

  // update spreadsheet class with the new active sheet
  useEffect(() => {
    spreadsheet.setActiveSheetIndex(activeSheet)
  }, [activeSheet])

  // Used to detect clicks outside of a TopToolBar menu.
  useEffect(() => {
    const shouldMenuClose = (e: any) => {
      if (
        toolBarMenuStatusList.includes(true) &&
        ((ref1.current && !ref1.current.contains(e.target)) ||
          (ref2.current && !ref2.current.contains(e.target)))
      ) {
        closeToolbarMenu()
      }
    }

    document.addEventListener('mousedown', shouldMenuClose)

    return () => {
      document.removeEventListener('mousedown', shouldMenuClose)
    }
  }, [toolBarMenuStatusList])

  const onUpload = (sheet: ISheet) => {
    // Checks to see if the uploaded sheet name already exists.
    // Adds a ([uploadedSheetIdCounter + 1]) to the end of name if
    // file already exists.
    let sheetName = sheet.getName().toLowerCase()
    let newName = sheet.getName().toLowerCase()
    let sheetNames = spreadsheet
      .getSheets()
      .map((sheetObj) => sheetObj.getName().toLowerCase())
    let tempIdCounter = 0
    for (let b = 0; b < sheetNames.length; b++) {
      if (sheetNames[b] === newName) {
        let sameName = true
        while (sameName) {
          tempIdCounter = tempIdCounter + 1
          newName = (sheetName + ' (' + tempIdCounter + ')').toLowerCase()
          let inNames = false
          for (let z = 0; z < sheetNames.length; z++) {
            if (sheetNames[z] === newName) {
              inNames = true
            }
          }
          sameName = inNames
        }
      }
    }
    if (tempIdCounter > 0) {
      sheet.rename(sheet.getName() + ' (' + tempIdCounter + ')')
    }
    spreadsheet.addSheet(sheet)
    setNumSheets(numSheets + 1)
    closeToolbarMenu()
  }

  return (
    <>
      <ChartCreationModal
        isOpen={isChartModalOpen}
        onClose={() => {
          setIsChartModalOpen(false)
          setRightDrawerOpen(true)
        }}
        sheet={spreadsheet.getSheets()[activeSheet]}
      />
      <RenameSheetModal
        isOpen={isRenameModalOpen}
        onClose={() => {
          setIsRenameModalOpen(false)
        }}
        onRename={(newName: string) => {
          const newOrder = [...tabOrder]
          newOrder[activeSheet] = newName
          setTabOrder(newOrder)
        }}
        sheet={spreadsheet.getSheets()[activeSheet]}
        sheetNames={spreadsheet
          .getSheets()
          .map((sheetObj) => sheetObj.getName().toLowerCase())}
      />
      <RightDrawer
        open={rightDrawerOpen}
        setOpen={setRightDrawerOpen}
        sheet={spreadsheet.getSheets()[activeSheet]}
      />
      <div>
        <ToolBarMenu
          beOpen={toolBarMenuStatusList[0]}
          class="ToolBarMenu"
          xPos={0}
          yPos={32}
          menuComponent={
            <ContextMenu ref={ref1}>
              <ContextMenuItem
                title="Download as CSV"
                onClick={() => {
                  CSV.export(spreadsheet.getSheets()[activeSheet])
                  closeToolbarMenu()
                }}
                closeMenuOnClick={false}
              />
              <CSVUploadButton onUpload={onUpload}>
                {(onClick) => (
                  <ContextMenuItem
                    title="Import CSV"
                    onClick={onClick}
                    closeMenuOnClick={false}
                  />
                )}
              </CSVUploadButton>
            </ContextMenu>
          }
        >
          <ToolBarMenu
            ref={ref2}
            beOpen={toolBarMenuStatusList[1]}
            class="ToolBarMenu"
            xPos={80}
            yPos={32}
            menuComponent={
              <ContextMenu ref={ref2}>
                <ContextMenuItem
                  title="Create New Chart"
                  onClick={() => {
                    setIsChartModalOpen(true)
                    closeToolbarMenu()
                  }}
                  closeMenuOnClick={false}
                />
                <ContextMenuItem
                  title="Open Created Charts"
                  onClick={() => {
                    setRightDrawerOpen(true)
                    closeToolbarMenu()
                  }}
                  closeMenuOnClick={false}
                />
              </ContextMenu>
            }
          >
            <div>
              <TopToolBar>
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (toolBarMenuStatusList.includes(true)) {
                      closeToolbarMenu()
                    } else {
                      setToolBarMenuStatus([true, false])
                    }
                  }}
                >
                  File
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (toolBarMenuStatusList.includes(true)) {
                      closeToolbarMenu()
                    } else {
                      setToolBarMenuStatus([false, true])
                    }
                  }}
                >
                  Chart
                </Button>
              </TopToolBar>
              <Sheet sheet={currentSheet} />
              <SheetTabs
                sheetIdCounter={sheetIdCounter}
                setSheetIdCounter={setSheetIdCounter}
                numSheets={numSheets}
                setNumSheets={setNumSheets}
                spreadsheet={spreadsheet}
                setIsRenameModalOpen={setIsRenameModalOpen}
                closeToolbarMenu={closeToolbarMenu}
                activeSheet={activeSheet}
                setActiveSheet={setActiveSheet}
                reorderToggle={reorderToggle}
                setReorderToggle={setReorderToggle}
                tabOrder={tabOrder}
                setTabOrder={setTabOrder}
              />
            </div>
          </ToolBarMenu>
        </ToolBarMenu>
      </div>
    </>
  )
}

export default Spreadsheet
