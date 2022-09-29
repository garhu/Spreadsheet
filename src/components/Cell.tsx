import React from 'react'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { ICell } from '../models/Cell'
import theme from './theme'
import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuProvider,
} from './ContextMenu'
import { useObserver } from './hooks'
import { toast } from 'react-toastify'
import { indexToLetters } from '../utils'
import Coordinates from '../models/Coordinates'

const StyledTD = styled.td`
  min-width: 5rem;
  height: 2rem;
  border: 1px solid gray;
  border-left: none;
  border-top: none;
  padding: 0rem;
`

const StyledInput = styled.input`
  height: 2rem;
  border: none;
  max-width: 5rem;
  &:focus {
    outline: none;
    border: 2px solid ${theme.colors.primary.main};
  }
`

type CellProps = {
  className?: string
  cell: ICell
  initialValue: string | number
  modifiedCells: number[][]
  virtualCoordinates: number[]
  coordinates: Coordinates
  setModifiedCells: (value: number[][]) => void
}

/**
 * Renders a spreadsheet cell for the user to enter input into. Gets data from the cell model and uses a state hook to update the content dynamically
 */
const InputCell = ({
  className,
  cell,
  initialValue,
  modifiedCells,
  virtualCoordinates,
  coordinates,
  setModifiedCells,
}: CellProps) => {
  const [rawContent, setRawContent] = useState(cell.getRawContent())
  const [isFocused, setIsFocused] = useState(false)
  const displayContent = useObserver(cell, initialValue)

  // on focus, render the cell's raw content, otherwise render the cell's display content
  useEffect(() => {
    try {
      isFocused && cell.setContent(rawContent.toString())
    } catch (e: any) {
      toast.error(`In cell ${indexToLetters(coordinates.getCol() - 1)}${coordinates.getRow()}: ${e.message}`)
    }
  }, [rawContent])

  // show a toast when the cell contains an error on unfocus of the cell
  useEffect(() => {
    !isFocused &&
      displayContent?.toString().startsWith('Error: ') &&
      toast.error(`In cell ${indexToLetters(coordinates.getCol() - 1)}${coordinates.getRow()}: ${displayContent}`)
  }, [isFocused])

  // checks to see if this cell has been modified and if so, adds it to a list seen by its sheet.
  useEffect(() => {
    if (isFocused && rawContent !== '') {
      let inList = false
      for (let x = 0; x < modifiedCells.length; x++) {
        if (
          virtualCoordinates[0] === modifiedCells[x][0] &&
          virtualCoordinates[1] === modifiedCells[x][1]
        ) {
          inList = true
        }
      }
      if (!inList) {
        modifiedCells.push(virtualCoordinates)
        setModifiedCells(modifiedCells)
      }
    }
  }, [isFocused, rawContent])

  return (
    <StyledTD className={className}>
      <ContextMenuProvider
        menuComponent={
          <ContextMenu>
            <ContextMenuItem
              title="Clear Contents"
              onClick={() => {
                cell.clearContents()
              }}
              closeMenuOnClick
            />
          </ContextMenu>
        }
      >
        <StyledInput
          value={isFocused ? rawContent : displayContent}
          onChange={(e) => setRawContent(e.target.value)}
          onFocus={() => {
            setIsFocused(true)
            setRawContent(cell.getRawContent())
          }}
          onBlur={() => {
            setIsFocused(false)
            setRawContent(cell.getDisplayContent())
          }}
        />
      </ContextMenuProvider>
    </StyledTD>
  )
}

export default React.memo(InputCell)
