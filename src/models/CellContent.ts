import Coordinates from './Coordinates'
import {
  lettersToIndex,
  indexToLetters,
  getIndexOfFirstNumber,
  CELL_RANGE_REGEX,
  CELL_NOTATION_REGEX,
} from '../utils'
import { Range } from './types'
import FormulaEvaluator from './formula/FormulaEvaluator'
import { ISheet } from './Sheet'

/**
 * Visits an instance of ICellContent
 */
export interface CellContentVisitor<T> {
  /**
   * Visit an instance of CellTextContents
   * @param contents
   */
  visitCellTextContents(contents: CellTextContents): T

  /**
   * Visit an instance of CellFormulaContents
   * @param contents
   */
  visitCellFormulaContents(contents: CellFormulaContents): T
}

/**
 * Visitor that visits cells that were moved due to a row insertion or deletion to adjust any cell references that may be present
 */
export class AdjustFormulasVisitor implements CellContentVisitor<void> {
  constructor(
    private row: number | undefined,
    private col: number | undefined,
    private deleted: boolean
  ) {}

  visitCellTextContents(contents: CellTextContents): void {
    return
  }

  visitCellFormulaContents(contents: CellFormulaContents): void {
    contents.shiftFormula(this.row, this.col, this.deleted)
  }
}

/**
 * Represents the content of a cell with a raw text value and a display value that is based on the raw value and may have some transformations applied.
 * The raw value is what is shown when the user is editing a cell, and the display value is shown when the cell is out of focus
 */
export interface ICellContent {
  /**
   * Gets the display value
   */
  getDisplayValue(): string
  /**
   * Gets the raw value
   */
  getRawValue(): string
  /**
   * Gets all cell ranges referenced by this cell, if any
   */
  getReferencedCellRanges(): Range[]
  /**
   * Accepts a visitor
   * @param visitor
   */
  accept<T>(visitor: CellContentVisitor<T>): T
}

/**
 * Represents a plain text cell with no special properties
 */
export class CellTextContents implements ICellContent {
  constructor(private text: string) {}

  getDisplayValue(): string {
    return this.text
  }
  getRawValue(): string {
    return this.text
  }

  getReferencedCellRanges() {
    return []
  }

  accept<T>(visitor: CellContentVisitor<T>): T {
    return visitor.visitCellTextContents(this)
  }
}

/**
 * Represents a cell with a formula that can be evaluated into some display value
 */
export class CellFormulaContents implements ICellContent {
  constructor(private rawValue: string, private sheetContext: ISheet) {}

  accept<T>(visitor: CellContentVisitor<T>): T {
    return visitor.visitCellFormulaContents(this)
  }

  /**
   * Shifts the cell references of this formula over by one, potentially in both axes, according to which row and which column were inserted
   * Here is basically how it works:
   *  find all cell range expressions in this formula, then:
   *    - if the row >= given row, and deleted == false, then add 1 to row
   *    - if the col >= given col, and deleted == false, then add 1 to col
   *    - if the row <= given row, and deleted == true, then subtract 1 from row
   *    - if the col <= given col, and deleted == true, then subtract 1 from col
   * @param row The inserted row, or undefined if no row was inserted
   * @param col The inserted column, or undefined if no column was inserted
   * @param deleted Whether the row and/or column were deleted instead of inserted
   */
  shiftFormula(
    row: number | undefined,
    col: number | undefined,
    deleted: boolean
  ) {
    this.rawValue = this.rawValue.replace(
      CELL_NOTATION_REGEX,
      (match, p1, p2) => {
        if (deleted) {
          return `${
            col !== undefined && lettersToIndex(p1) <= col
              ? indexToLetters(lettersToIndex(p1) - 1)
              : p1
          }${
            row !== undefined && parseInt(p2) <= row
              ? (parseInt(p2) - 1).toString()
              : p2
          }`
        }
        return `${
          col !== undefined && lettersToIndex(p1) >= col
            ? indexToLetters(lettersToIndex(p1) + 1)
            : p1
        }${
          row !== undefined && parseInt(p2) >= row
            ? (parseInt(p2) + 1).toString()
            : p2
        }`
      }
    )
  }

  getReferencedCellRanges(): Range[] {
    const matches = Array.from(this.rawValue.matchAll(CELL_RANGE_REGEX))

    const ranges: Range[] = []
    for (const match of matches) {
      const rng1: string = match[1]
      // split by first index of number
      const indexOfFirstNumber = getIndexOfFirstNumber(rng1)
      const col1 = rng1.substring(0, indexOfFirstNumber)
      const row1 = parseInt(rng1.substring(indexOfFirstNumber))
      const coords1 = new Coordinates(row1, lettersToIndex(col1) + 1)

      const rng2 = match[2]
      if (rng2) {
        const indexOfFirstNumber = getIndexOfFirstNumber(rng1)
        const col2 = rng2.substring(0, indexOfFirstNumber)
        const row2 = parseInt(rng2.substring(indexOfFirstNumber))
        const coords2 = new Coordinates(row2, lettersToIndex(col2) + 1)
        ranges.push([coords1, coords2])
      } else {
        ranges.push([coords1, coords1])
      }
    }

    return ranges
  }

  getDisplayValue(): string {
    let value
    try {
      value = FormulaEvaluator.getInstance().evaluate(
        this.rawValue,
        this.sheetContext
      )
    } catch (e) {
      // invalid expression
      const err = 'Error: ' + ((e as Error).message ?? '')
      return err
    }

    // if is number
    if (!isNaN(parseFloat(value))) {
      return (Math.round(Number(value) * 1000) / 1000).toString()
    }
    return value
  }

  getRawValue(): string {
    return '=' + this.rawValue
  }
}
