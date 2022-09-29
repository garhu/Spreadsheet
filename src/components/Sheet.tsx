import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import Coordinates from '../models/Coordinates'
import { ISheet } from '../models/Sheet'
import { indexToLetters } from '../utils'
import InputCell from './Cell'
import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuProvider,
} from './ContextMenu'
import HeaderCell from './HeaderCell'

const StyledTable = styled.table`
  border-spacing: 0;
  overflow-x: scroll;
  border-collapse: separate;
  margin-top: 35px;
  margin-bottom: 41px;
`

const StyledRow = styled.tr`
  th {
    left: 0;
    z-index: 2;
  }
`

const CornerCell = styled(HeaderCell)`
  position: sticky;
  left: 0;
  z-index: 6;
  background-color: darkGray;
`

type Props = {
  sheet: ISheet
}

const LetterContainer = styled.div`
  width: 100%;
  height: 100%;
`

/**
 * Renders a single sheet from a spreadsheet.
 */
const Sheet: React.FC<Props> = ({ sheet }) => {
  // these mappings are necessary for when we insert/delete columns/rows.
  const [columnMapping, setColumnMapping] = useState(
    Array.from(Array(sheet.getWidth())).map((_, i) => i)
  )
  const [rowMapping, setRowMapping] = useState(
    Array.from(Array(sheet.getHeight())).map((_, i) => i)
  )

  const [modifiedCells, setModifiedCells] = useState([[0, 0]])

  // get the top header row list of letters
  const headerRow = useMemo(
    () =>
      Array.from(Array(sheet.getWidth())).map((e, index) =>
        indexToLetters(index)
      ),
    [sheet.getWidth()]
  )

  // checks if the cell at the given coordinates has been modified
  // and if it has, gives the element a unique key
  const areCoordinatesModified = (coordinates: number[]) => {
    for (let x = 0; x < modifiedCells.length; x++) {
      if (
        coordinates[0] === modifiedCells[x][0] &&
        coordinates[1] === modifiedCells[x][1]
      ) {
        return true
      }
    }
    return false
  }

  return (
    <StyledTable>
      <thead>
        <tr>
          <CornerCell />
          {headerRow.map((letter, idx) => (
            <HeaderCell key={`${columnMapping[idx]}`}>
              <ContextMenuProvider
                containerElement={({ children, ...rest }) => (
                  <LetterContainer {...rest}>{children}</LetterContainer>
                )}
                menuComponent={
                  <ContextMenu>
                    <ContextMenuItem
                      title="Insert Column"
                      onClick={() => {
                        sheet.addColumn(idx)
                        const maxCol = Math.max(...columnMapping)
                        const newColumnMapping = [...columnMapping]
                        newColumnMapping.splice(idx, 0, maxCol + 1)
                        setColumnMapping(newColumnMapping)
                      }}
                      closeMenuOnClick
                    />
                    <ContextMenuItem
                      title="Delete Column"
                      onClick={() => {
                        sheet.deleteColumn(idx)
                        const newColumnMapping = [...columnMapping]
                        newColumnMapping.splice(idx, 1)
                        setColumnMapping(newColumnMapping)
                      }}
                      closeMenuOnClick
                    />
                  </ContextMenu>
                }
              >
                {letter}
              </ContextMenuProvider>
            </HeaderCell>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from(Array(sheet.getHeight())).map((_, r) => {
          return (
            <StyledRow key={rowMapping[r]}>
              <HeaderCell>
                <ContextMenuProvider
                  containerElement={({ children, ...rest }) => (
                    <LetterContainer {...rest}>{children}</LetterContainer>
                  )}
                  menuComponent={
                    <ContextMenu>
                      <ContextMenuItem
                        title="Insert Row"
                        onClick={() => {
                          sheet.addRow(r)
                          const maxRow = Math.max(...rowMapping)
                          const newRowMapping = [...rowMapping]
                          newRowMapping.splice(r, 0, maxRow + 1)
                          setRowMapping(newRowMapping)
                        }}
                        closeMenuOnClick
                      />
                      <ContextMenuItem
                        title="Delete Row"
                        onClick={() => {
                          sheet.deleteRow(r)
                          const newRowMapping = [...rowMapping]
                          newRowMapping.splice(r, 1)
                          setRowMapping(newRowMapping)
                        }}
                        closeMenuOnClick
                      />
                    </ContextMenu>
                  }
                >
                  {r + 1}
                </ContextMenuProvider>
              </HeaderCell>
              {[
                ...sheet.getCellRange([
                  new Coordinates(r + 1, 1),
                  new Coordinates(r + 1, sheet.getWidth()),
                ]),
              ].map((cell, c) => {
                return (
                  <InputCell
                    cell={cell}
                    initialValue={cell.getDisplayContent()}
                    virtualCoordinates={[rowMapping[r], columnMapping[c]]}
                    coordinates={new Coordinates(r + 1, c + 1)}
                    setModifiedCells={setModifiedCells}
                    modifiedCells={modifiedCells}
                    key={
                      (modifiedCells.length > 1 &&
                        areCoordinatesModified([
                          rowMapping[r],
                          columnMapping[c],
                        ])) ||
                      cell.getDisplayContent() !== ''
                        ? `${sheet.getName()},${rowMapping[r]},${
                            columnMapping[c]
                          }`
                        : `${rowMapping[r]},${columnMapping[c]}`
                    }
                  />
                )
              })}
            </StyledRow>
          )
        })}
      </tbody>
    </StyledTable>
  )
}

export default Sheet
