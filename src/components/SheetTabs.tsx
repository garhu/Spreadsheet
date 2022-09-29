import React, { useState, forwardRef, useEffect } from 'react'
import styled from 'styled-components'
import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuProvider,
} from './ContextMenu'
import Button from './Button'
import { ISpreadsheet } from '../models/Spreadsheet'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from 'react-beautiful-dnd'

const SheetTabsContainer = styled.div`
  border: 1px solid gray;
  padding: 0.25rem 0.5rem;
  position: fixed;
  width: 100%;
  bottom: 0px;
  height: 42px;
  z-index: 7;
  background-color: lightGray;
`

const SheetOptionsDiv = styled.div`
  max-height: 32px;
  display: flex;
  flex-direction: row;
`

const PlusButtonDiv = styled.div`
  position: fixed;
  left: 20px;
  bottom: 5px;
`

const SheetTabsDividerDiv = styled.div`
  height: 32px;
  background-color: rgba(128, 128, 128, 0.75);
  width: 2px;
  position: fixed;
  left: 119px;
  bottom: 5px;
  border-radius: 20%;
`

const SelectableTabsDiv = styled.div`
  position: fixed;
  bottom: 5px;
  left: 140px;
  max-height: 32px;
  width: 1370px;
  overflow-x: scroll;
`

type Props = {
  sheetIdCounter: number
  setSheetIdCounter: (count: number) => void
  numSheets: number
  setNumSheets: (num: number) => void
  spreadsheet: ISpreadsheet
  setIsRenameModalOpen: (open: boolean) => void
  closeToolbarMenu: () => void
  activeSheet: number
  setActiveSheet: (active: number) => void
  reorderToggle: boolean
  setReorderToggle: (value: boolean) => void
  tabOrder: string[]
  setTabOrder: (order: string[]) => void
}

/**
 * Renders the SheetTabs at the bottom of the app. Sheet tabs can be added, renamed, deleted, and reordered.
 */
const SheetTabs = forwardRef(
  (
    {
      sheetIdCounter,
      spreadsheet,
      setSheetIdCounter,
      numSheets,
      setNumSheets,
      setIsRenameModalOpen,
      closeToolbarMenu,
      activeSheet,
      setActiveSheet,
      reorderToggle,
      setReorderToggle,
      tabOrder,
      setTabOrder,
    }: Props,
    ref2
  ) => {
    const names = spreadsheet.getSheets().map((s) => s.getName())
    // update the tabOrder when the length of the list of sheets changes
    useEffect(() => {
      const newOrder = [...tabOrder]
      // add all new sheets to the sheet order
      for (const name of names) {
        if (!newOrder.includes(name)) {
          newOrder.push(name)
        }
      }
      // remove all removed sheets from the sheet order
      for (const id of newOrder) {
        if (!names.includes(id)) {
          newOrder.splice(newOrder.indexOf(id), 1)
        }
      }
      setTabOrder(newOrder)
    }, [JSON.stringify(names)])

    // update the tabOrder with the sheet tab that has been moved
    const onDragEnd = (result: DropResult) => {
      // dropped outside the list
      if (!result.destination) {
        return
      }

      const activeSheetName = sortedTabs[activeSheet]

      const newOrder = [...tabOrder]
      const movedItem = newOrder.splice(result.source.index, 1)[0]
      newOrder.splice(result.destination.index, 0, movedItem)

      setTabOrder(newOrder)
      const newSheets = spreadsheet.reorderSheets(
        result.source.index,
        result.destination.index
      )
      setReorderToggle(!reorderToggle)
      const newActiveSheet = newSheets.findIndex(
        (s) => s.getName() === activeSheetName
      )
      newActiveSheet !== -1 && setActiveSheet(newActiveSheet)
      setTabOrder(newOrder)
    }

    // sort the sheet tabs based on the tabOrder
    const sortTabs = (tabOrder: string[]) => {
      const orderMap: { [id: string]: number } = {}
      for (let i = 0; i < tabOrder.length; i++) {
        orderMap[tabOrder[i]] = i
      }
      const tabs = [...names]
      return tabs.sort((a, b) => orderMap[a] - orderMap[b])
    }

    const sortedTabs = sortTabs(tabOrder)

    return (
      <SheetTabsContainer>
        <PlusButtonDiv>
          <Button
            variant="sheet-secondary"
            onClick={() => {
              let newName = ('Sheet ' + (sheetIdCounter + 1)).toLowerCase()
              let sheetNames = sortedTabs
              let tempIdCounter = sheetIdCounter
              for (let b = 0; b < sheetNames.length; b++) {
                if (sheetNames[b] === newName) {
                  let sameName = true
                  while (sameName) {
                    tempIdCounter = tempIdCounter + 1
                    newName = ('Sheet ' + (tempIdCounter + 1)).toLowerCase()
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
              spreadsheet.addSheet(
                spreadsheet.createSheet('Sheet ' + (tempIdCounter + 1))
              )
              setSheetIdCounter(tempIdCounter + 1)
              setNumSheets(numSheets + 1)
            }}
          >
            {' '}
            Add Sheet{' '}
          </Button>
        </PlusButtonDiv>
        <SheetOptionsDiv>
          <SheetTabsDividerDiv />
          <SelectableTabsDiv>
            <ContextMenuProvider
              menuComponent={
                <ContextMenu ref={ref2}>
                  <ContextMenuItem
                    title="Rename Sheet"
                    onClick={() => {
                      setIsRenameModalOpen(true)
                      closeToolbarMenu()
                    }}
                    closeMenuOnClick={false}
                  />
                  <ContextMenuItem
                    title="Delete Sheet"
                    onClick={() => {
                      spreadsheet.deleteSheetByIndex(activeSheet)
                      if (spreadsheet.getSheets().length === 0) {
                        spreadsheet.addSheet(
                          spreadsheet.createSheet(
                            'Sheet ' + (sheetIdCounter + 1)
                          )
                        )
                        setSheetIdCounter(sheetIdCounter + 1)
                        setActiveSheet(0)
                      } else {
                        if (activeSheet !== 0) {
                          setActiveSheet(activeSheet - 1)
                        }

                        setNumSheets(numSheets - 1)
                      }
                    }}
                    closeMenuOnClick={false}
                  />
                </ContextMenu>
              }
              yOffset={75}
            >
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="droppable" direction="horizontal">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{ display: 'flex', overflow: 'auto' }}
                    >
                      {sortedTabs.map((tabName, i) => (
                        <Draggable
                          key={tabName}
                          draggableId={tabName}
                          index={i}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={provided.draggableProps.style}
                            >
                              <Button
                                variant={
                                  activeSheet === i
                                    ? 'sheet-primary'
                                    : 'sheet-secondary'
                                }
                                onClick={
                                  activeSheet !== i
                                    ? () => setActiveSheet(i)
                                    : () => {}
                                }
                                onContextMenu={() => setActiveSheet(i)}
                              >
                                {' '}
                                {tabName}{' '}
                              </Button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </ContextMenuProvider>
          </SelectableTabsDiv>
        </SheetOptionsDiv>
      </SheetTabsContainer>
    )
  }
)

export default SheetTabs
