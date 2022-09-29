import {
  ICellContent,
  CellFormulaContents,
  CellTextContents,
} from '../models/CellContent'
import Coordinates from '../models/Coordinates'
import { Sheet } from '../models/Sheet'

describe('cell content tests', () => {
  it('cell text contents getDisplayValue string', (): void => {
    const c = new CellTextContents('hello')
    expect(c.getDisplayValue()).toEqual('hello')
  })
  it('cell text contents getDisplayValue number', (): void => {
    const c = new CellTextContents('5')
    expect(c.getDisplayValue()).toEqual('5')
    expect(c.getRawValue()).toEqual('5')
  })
  it('cell formula contents getDisplayValue number', (): void => {
    const sht = Sheet.fromArray([], 'sht1')
    const c = new CellFormulaContents('5 + 5', sht)
    expect(c.getDisplayValue()).toEqual('10')
  })
  it('cell formula contents getDisplayValue string', (): void => {
    const sht = Sheet.fromArray([], 'sht1')
    const c = new CellFormulaContents('"5" + "5"', sht)
    expect(c.getDisplayValue()).toEqual('55')
  })
  it('cell formula contents syntax error 1', () => {
    const sht = Sheet.fromArray([], 'sht1')
    const c = new CellFormulaContents('SUM(5, 5', sht)
    expect(c.getDisplayValue()).toEqual(
      `Error: Unexpected token, expected \",\" (1:8)`
    )
  })
  it('cell formula contents syntax error 1', () => {
    const sht = Sheet.fromArray([], 'sht1')
    const c = new CellFormulaContents('5 +', sht)
    expect(c.getDisplayValue()).toEqual('Error: Unexpected token (1:3)')
  })
  it('cell formula contents extractCellReferences', () => {
    const sht = Sheet.fromArray([], 'sht1')
    const c = new CellFormulaContents('REF(A1)', sht)
    expect(c.getReferencedCellRanges()).toEqual([
      [new Coordinates(1, 1), new Coordinates(1, 1)],
    ])
  })
  it('cell formula contents extractCellReferences multiple', () => {
    const sht = Sheet.fromArray([], 'sht1')
    const c = new CellFormulaContents('REF(A1) + REF(A3..B4)', sht)
    expect(c.getReferencedCellRanges()).toEqual([
      [new Coordinates(1, 1), new Coordinates(1, 1)],
      [new Coordinates(3, 1), new Coordinates(4, 2)],
    ])
  })
  it('shiftFormula works for shifting row', () => {
    const sht = Sheet.fromArray([], 'sht1')
    const c = new CellFormulaContents('REF(A1)', sht)
    c.shiftFormula(0, undefined, false)
    expect(c.getRawValue()).toEqual('=REF(A2)')
  })
  it('shiftFormula works for shifting col', () => {
    const sht = Sheet.fromArray([], 'sht1')
    const c = new CellFormulaContents('REF(A1)', sht)
    c.shiftFormula(undefined, 0, false)
    expect(c.getRawValue()).toEqual('=REF(B1)')
  })
  it('shiftFormula works for shifting col and row', () => {
    const sht = Sheet.fromArray([], 'sht1')
    const c = new CellFormulaContents('REF(A1)', sht)
    c.shiftFormula(0, 0, false)
    expect(c.getRawValue()).toEqual('=REF(B2)')
  })
})
