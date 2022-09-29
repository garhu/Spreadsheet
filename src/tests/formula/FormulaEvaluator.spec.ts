import FormulaEvaluator from '../../models/formula/FormulaEvaluator'
import { Sheet } from '../../models/Sheet'
import Cell from '../../models/Cell'
import Coordinates from '../../models/Coordinates'

describe('formula evaluator works as expected', () => {
  let sheet: Sheet
  let evaluator: FormulaEvaluator
  beforeAll(() => {
    const cells = [
      [
        new Cell('=5 + 5'),
        new Cell('5'),
        new Cell('5'),
        new Cell('5'),
        new Cell('5'),
        new Cell('5'),
        new Cell('5'),
        new Cell('5'),
        new Cell('5'),
        new Cell('5'),
        new Cell('5'),
        new Cell('5'),
        new Cell('5'),
        new Cell('5'),
        new Cell('5'),
        new Cell('5'),
        new Cell('5'),
        new Cell('5'),
        new Cell('5'),
        new Cell('5'),
        new Cell('5'),
        new Cell('5'),
        new Cell('5'),
        new Cell('5'),
        new Cell('5'),
        new Cell('5'),
        new Cell('6'), // AA1
        new Cell('7'), // AB1
      ],
      [new Cell('="str" + "ing"'), new Cell('')],
    ]
    sheet = Sheet.fromArray(cells, 'sht1')
    evaluator = FormulaEvaluator.getInstance()
  })

  it('5 + 5 cell evaluates correctly', (): void => {
    expect(evaluator.evaluate('5 + 5', sheet)).toEqual(10)
  })
  it('cell reference evaluates correctly', (): void => {
    expect(evaluator.evaluate('REF(B1)', sheet)).toEqual(5)
  })
  it('cell reference to formula cell evaluates correctly', (): void => {
    expect(evaluator.evaluate('REF(A1)', sheet)).toEqual(10)
  })
  it('cell range reference evaluates correctly', (): void => {
    expect(evaluator.evaluate('REF(A1..B1)', sheet)).toEqual([10, 5])
  })
  it('sum function works', (): void => {
    expect(evaluator.evaluate('SUM(1, 2, 3, 4, 5)', sheet)).toEqual(15)
  })
  it('sum of cell range works correctly', (): void => {
    expect(evaluator.evaluate('SUM(A1..B1)', sheet)).toEqual(15)
  })
  it('sum of cell reference range works correctly', (): void => {
    expect(evaluator.evaluate('SUM(REF(A1..B1))', sheet)).toEqual(15)
  })
  it('can add strings together', (): void => {
    expect(evaluator.evaluate('"str" + "ing"', sheet)).toEqual('string')
  })
  it('ensure cannot mix number and string in addition', (): void => {
    expect(() => evaluator.evaluate('SUM("str", 5)', sheet)).toThrowError()
  })
  it('average function works', (): void => {
    expect(evaluator.evaluate('AVG(6, 10)', sheet)).toEqual(8)
  })
  it('ensure average function cannot take string', (): void => {
    expect(() => evaluator.evaluate('AVG("str", 5)', sheet)).toThrowError()
  })
  it('average of cell range works correctly', (): void => {
    expect(evaluator.evaluate('AVG(A1..B1)', sheet)).toEqual(7.5)
  })
  it('average of cell reference works', (): void => {
    expect(evaluator.evaluate('AVG(REF(A1..B1))', sheet)).toEqual(7.5)
  })
  it('average of cell reference and other numbers works', (): void => {
    expect(evaluator.evaluate('AVG(REF(A1..B1), 10)', sheet)).toBeCloseTo(8.33)
  })
  it('can reference cells with multiple letters', (): void => {
    expect(evaluator.evaluate('REF(AA1)', sheet)).toEqual(6)
  })
  it('sum of cells with multiple letters', (): void => {
    expect(evaluator.evaluate('SUM(AA1..AB1)', sheet)).toEqual(13)
  })
})
