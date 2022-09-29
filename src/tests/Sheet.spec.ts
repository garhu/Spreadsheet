import Cell from '../models/Cell'
import Coordinates from '../models/Coordinates'
import { Sheet } from '../models/Sheet'

describe('Sheet module tests', () => {
  it('getCellRange/getCellAt', () => {
    const c1 = new Cell('test'),
      c2 = new Cell('test2'),
      c3 = new Cell('test2'),
      c4 = new Cell('test2')
    const sht = Sheet.fromArray(
      [
        [c1, c2],
        [c3, c4],
      ],
      'name'
    )

    expect(
      sht.getCellRange([new Coordinates(1, 1), new Coordinates(2, 1)]).asArray()
    ).toEqual([[c1], [c3]])
    expect(
      sht.getCellRange([new Coordinates(1, 1), new Coordinates(1, 2)]).asArray()
    ).toEqual([[c1, c2]])
    expect(
      sht.getCellRange([new Coordinates(1, 1), new Coordinates(2, 2)]).asArray()
    ).toEqual([
      [c1, c2],
      [c3, c4],
    ])
    expect(() =>
      sht.getCellRange([new Coordinates(1, 1), new Coordinates(2, 3)]).asArray()
    ).toThrowError()
    expect(() =>
      sht.getCellRange([new Coordinates(1, 1), new Coordinates(3, 2)]).asArray()
    ).toThrowError()

    expect(sht.getCellAt(new Coordinates(1, 1))).toEqual(c1)
    expect(() => sht.getCellAt(new Coordinates(3, 3))).toThrowError()
  })
  it('get/set name', () => {
    const c = new Cell('test')
    const sht = Sheet.fromArray([[c]], 'name')

    expect(sht.getName()).toEqual('name')
    sht.rename('name2')
    expect(sht.getName()).toEqual('name2')
  })
  it('get/set highlighted range', () => {
    const c = new Cell('test')
    const sht = Sheet.fromArray([[c]], 'name')

    expect(sht.getHighlightedRange()).toBeUndefined()
    sht.setHighlightedRange([new Coordinates(1, 1), new Coordinates(2, 2)])
    expect(sht.getHighlightedRange()).toEqual([
      new Coordinates(1, 1),
      new Coordinates(2, 2),
    ])
  })
  it('get/set active cell coords', () => {
    const c = new Cell('test')
    const sht = Sheet.fromArray([[c]], 'name')

    expect(sht.getActiveCellCoordinates()).toBeUndefined()
    sht.setActiveCellCoordinates(new Coordinates(1, 1))
    expect(sht.getActiveCellCoordinates()).toEqual(new Coordinates(1, 1))
  })
})
