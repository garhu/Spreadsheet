import Coordinates from './Coordinates'
import Cell, { ICell } from './Cell'
import Chart from './Chart'
import { Range } from './types'
import { AdjustFormulasVisitor } from './CellContent'

export const NUM_ROWS = 100

/**
 * Represents a rectangular range of cells
 */
export interface ICellRange extends Iterable<ICell> {
  /**
   * Gets a cell in this range at the given coordinates.
   * @param coords The coordinates
   */
  getCellAt(coords: Coordinates): ICell

  /**
   * Gets the width of this range
   */
  getWidth(): number

  /**
   * Gets the height of this range
   */
  getHeight(): number

  /**
   * Creates a subrange from this range
   * @param rowOffset The row offset from the top left
   * @param colOffset THe column offset from the top left
   * @param width The width of the range
   * @param height The height of the range
   */
  getSubRange(
    rowOffset: number,
    colOffset: number,
    width: number,
    height: number
  ): ICellRange

  /**
   * Produces the contents of the cell range as a 2D array in row-major order
   */
  asArray(): ICell[][]
}

/**
 * Represents a sheet of cells arranged in a 2D grid.
 * A sheet is a cell range.
 */
export interface ISheet extends ICellRange {
  /**
   * Gets the coordinates of the active cell, or undefined if no cell is active
   */
  getActiveCellCoordinates(): Coordinates | undefined // is this method needed if the above method is present?

  /**
   * Gets the name of this sheet
   */
  getName(): string

  /**
   * Renames this sheet
   * @param name the name
   */
  rename(name: string): void

  /**
   * Adds a row at the given row index to this sheet
   * @param index The index at which to add the row
   */
  addRow(index: number): void

  /**
   * Adds a column at the given column index to this sheet
   * @param index The index at which to add the column
   */
  addColumn(index: number): void

  /**
   * Deletes a row at the given row index
   * @param index The index at which to delete the row
   */
  deleteRow(index: number): void

  /**
   * Deletes a row at the given column index
   * @param index The index at which to delete the column
   */
  deleteColumn(index: number): void

  /**
   * Adds a chart to this sheet
   * @param chart The chart
   */
  addChart(chart: Chart): void

  /**
   * Removes the given chart from this sheet
   * @param chart The chart
   */
  deleteChart(chart: Chart): void

  /**
   * Removes the chart at the given index from this sheet
   * Charts can be seen with getCharts()
   * @param index The index at which to delete the chart
   */
  deleteChartByIndex(index: number): void

  /**
   * Gets the charts that are part of this sheet
   */
  getCharts(): Chart[]

  /**
   * Get the spanning range for all the data in the sheet
   */
  getCellRangeWithData(): ICellRange

  /**
   * Get the range of cells delimited by the given range
   * @param rng The range
   */
  getCellRange(rng: Range): ICellRange

  /**
   * Sets the active cell coordinate
   * @param coords The coordinates
   */
  setActiveCellCoordinates(coords: Coordinates): void

  /**
   * Factory method creating cells
   */
  createCell(): ICell
}

/**
 * Represents a cell range that is a subrange of another cell range
 */
export class DerivedCellRange implements ICellRange {
  constructor(
    private cellRange: ICellRange,
    private rowOffset: number,
    private colOffset: number,
    private width: number,
    private height: number
  ) {
    if (cellRange.getWidth() - colOffset < width) {
      throw new Error('Width is too large. Cell range goes out of bounds')
    }
    if (cellRange.getHeight() - rowOffset < height) {
      throw new Error('Height is too large. Cell range goes out of bounds')
    }
  }
  asArray(): ICell[][] {
    const out = []
    let row = []
    let i = 0
    for (let cell of this) {
      row.push(cell)
      i++
      if (i % this.width === 0) {
        out.push(row)
        row = []
      }
    }
    return out
  }

  getSubRange(
    rowOffset: number,
    colOffset: number,
    width: number,
    height: number
  ): ICellRange {
    return new DerivedCellRange(this, rowOffset, colOffset, width, height)
  }

  [Symbol.iterator](): Iterator<ICell, any, undefined> {
    return new CellRangeIterator(this)
  }

  getCellAt(coords: Coordinates) {
    return this.cellRange.getCellAt(
      new Coordinates(
        coords.getRow() + this.rowOffset,
        coords.getCol() + this.colOffset
      )
    )
  }

  getWidth() {
    return this.width
  }

  getHeight() {
    return this.height
  }
}

/**
 * Iterator that iterates through cells in a cell range in row-major order.
 */
class CellRangeIterator implements Iterator<ICell, any, undefined> {
  private cellRange: ICellRange
  private index: number

  constructor(cellRange: ICellRange) {
    this.cellRange = cellRange
    this.index = 0
  }

  next(...args: [] | [undefined]): IteratorResult<ICell, any> {
    // iterate in row-major order

    const row = Math.trunc(this.index / this.cellRange.getWidth())
    const col = this.index % this.cellRange.getWidth()
    this.index++
    const done =
      this.index > this.cellRange.getWidth() * this.cellRange.getHeight()
    return done
      ? {
          value: null,
          done: true,
        }
      : {
          value: this.cellRange.getCellAt(new Coordinates(row + 1, col + 1)),
        }
  }
}

/**
 * Implementation of a sheet that stores cells in a 2D array
 */
export class Sheet implements ISheet {
  private cells: ICell[][]
  private charts: Chart[]

  constructor(
    private name: string,
    private width: number,
    private height: number,
    private activeCellCoordinates?: Coordinates,
    private highlightedRange?: Range
  ) {
    this.cells = Array.from(Array(height)).map((_, r) =>
      Array.from(Array(width)).map((_, c) => this.createCell())
    )
    this.charts = []
  }
  asArray(): ICell[][] {
    return this.cells
  }
  createCell(): ICell {
    return new Cell('', this)
  }
  [Symbol.iterator](): Iterator<ICell, any, undefined> {
    return new CellRangeIterator(this)
  }
  getActiveCellCoordinates(): Coordinates | undefined {
    return this.activeCellCoordinates
  }
  getCharts(): Chart[] {
    return this.charts
  }
  getHighlightedRange(): Range | undefined {
    return this.highlightedRange
  }
  getName(): string {
    return this.name
  }
  getWidth(): number {
    return this.width
  }
  getHeight(): number {
    return this.height
  }

  // This is a slow operation--try to speed this up
  deleteChartByIndex(index: number): void {
    this.charts.splice(index, 1)
  }

  addRow(index: number) {
    const rowLength = this.cells[0].length
    this.cells.splice(
      index,
      0,
      Array.from(Array(rowLength)).map((e, i) => {
        return this.createCell()
      })
    )
    this.cells.forEach((row) => {
      row.forEach((cell) => {
        cell.visitContent(new AdjustFormulasVisitor(index, undefined, false))
      })
    })
    this.height++
  }

  addColumn(index: number) {
    this.cells.forEach((row, rowNum) => {
      row.splice(index, 0, this.createCell())
    })
    this.cells.forEach((row) => {
      row.forEach((cell) => {
        cell.visitContent(new AdjustFormulasVisitor(undefined, index, false))
      })
    })
    this.width++
  }

  deleteRow(index: number) {
    this.cells.splice(index, 1)
    this.cells.forEach((row) => {
      row.forEach((cell) => {
        cell.visitContent(new AdjustFormulasVisitor(index, undefined, true))
      })
    })
    this.height--
  }

  deleteColumn(index: number) {
    this.cells.forEach((row) => {
      row.splice(index, 1)
    })
    this.cells.forEach((row) => {
      row.forEach((cell) => {
        cell.visitContent(new AdjustFormulasVisitor(undefined, index, true))
      })
    })
    this.width--
  }

  addChart(chart: Chart) {
    this.charts.push(chart)
  }

  deleteChart(chart: Chart) {
    const idx = this.charts.findIndex((_chart) => chart === _chart)
    this.charts.splice(idx, 1)
  }

  rename(newName: string) {
    this.name = newName
  }

  // return the minimum grid of cells in the sheet that contains all the data in the sheet
  getCellRangeWithData(): ICellRange {
    let maxRow = 0
    let maxColumn = 0
    for (let i = 0; i < this.cells.length; i++) {
      if (!!this.cells[i].find((c) => c.getRawContent()) && i > maxRow) {
        maxRow = i
      }
      for (let j = 0; j < this.cells[i].length; j++) {
        if (this.cells[i][j].getRawContent() && j > maxColumn) {
          maxColumn = j
        }
      }
    }

    return new DerivedCellRange(this, 0, 0, maxColumn + 1, maxRow + 1)
  }

  getCellAt(coords: Coordinates): ICell {
    return this.cells[coords.getRow() - 1][coords.getCol() - 1]
  }

  getSubRange(
    rowOffset: number,
    colOffset: number,
    width: number,
    height: number
  ): ICellRange {
    return new DerivedCellRange(this, rowOffset, colOffset, width, height)
  }

  getCellRange(range: Range): ICellRange {
    const rowOffset = range[0].getRow() - 1
    const colOffset = range[0].getCol() - 1
    const width = range[1].getCol() - range[0].getCol() + 1
    const height = range[1].getRow() - range[0].getRow() + 1
    return this.getSubRange(rowOffset, colOffset, width, height)
  }

  setActiveCellCoordinates(coords: Coordinates) {
    this.activeCellCoordinates = coords
  }

  setHighlightedRange(range: Range) {
    this.highlightedRange = range
  }

  /**
   * Creates an instance of Sheet from the given 2-D array
   * @param cells A row-major 2d array of cells
   * @param name The name of the sheet
   * @returns The new sheet
   */
  static fromArray(cells: ICell[][], name: string) {
    const width = Math.max(...cells.map((row) => row.length))
    const sht = new Sheet(name, width, cells.length)
    cells.forEach((row) =>
      row.forEach((cell) => {
        cell.setOwningSheet(sht)
      })
    )
    sht.cells = cells
    return sht
  }
}
