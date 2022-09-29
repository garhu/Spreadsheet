import { Sheet } from '../models/Sheet'
import Cell from '../models/Cell'
import Coordinates from '../models/Coordinates'
import Observer from '../models/interfaces/Observer'

class MockObserver implements Observer<string> {
  public log: string[]

  constructor() {
    this.log = []
  }

  handleUpdate(subject: string): void {
    this.log.push(subject)
  }
}

describe('cell tests', (): void => {
  it('contents can be cleared', (): void => {
    const c = new Cell('test')
    expect(c.getDisplayContent()).toEqual('test')
    expect(c.getRawContent()).toEqual('test')
    c.clearContents()
    expect(c.getDisplayContent()).toEqual('')
    expect(c.getRawContent()).toEqual('')
  })
  it('formula contents render correctly', (): void => {
    const c = new Cell('=5 + 5')
    expect(c.getRawContent()).toEqual('=5 + 5')
    expect(c.getDisplayContent()).toEqual('10')
  })
  it('error when cell is referenced in formula without owning sheet set', (): void => {
    expect(() => {
      const c = new Cell('=REF(A2)')
    }).toThrowError()
  })
  it('test observer', (): void => {
    const c = new Cell('test')
    const obs = new MockObserver()
    c.attachObserver(obs)
    c.setContent('test2')
    expect(obs.log[0]).toEqual(c.getDisplayContent())
  })
  it('test observer detach', (): void => {
    const c = new Cell('test')
    const obs = new MockObserver()
    c.attachObserver(obs)
    c.detachObserver(obs)
    c.setContent('test2')
    expect(obs.log.length).toEqual(0)
  })
  it('test handle update propagates', (): void => {
    const c = new Cell('test')
    const obs = new MockObserver()
    c.attachObserver(obs)
    c.handleUpdate()
    expect(obs.log[0]).toEqual(c.getDisplayContent())
  })
  it('test cycle detection', (): void => {
    const sht = new Sheet('sht1', 2, 1)
    sht.getCellAt(new Coordinates(1, 1)).setContent('=B1')
    expect(() => sht.getCellAt(new Coordinates(1, 2)).setContent('=A1')).toThrowError()
  })
  it('test cell auto-reference detection', (): void => {
    const sht = new Sheet('sht1', 2, 1)
    expect(() => sht.getCellAt(new Coordinates(1, 1)).setContent('=A1')).toThrowError()
  })
  it('test three-way non-cycle does not get flagged', (): void => {
    const sht = new Sheet('sht1', 3, 1)
    sht.getCellAt(new Coordinates(1, 3)).setContent('1')
    sht.getCellAt(new Coordinates(1, 2)).setContent('=C1')
    sht.getCellAt(new Coordinates(1, 1)).setContent('=B1 + C1')
    expect(sht.getCellAt(new Coordinates(1, 1)).getDisplayContent()).toEqual('2')
  })
  it('test three-way cycle gets flagged', (): void => {
    const sht = new Sheet('sht1', 3, 1)
    sht.getCellAt(new Coordinates(1, 3)).setContent('=A1')
    sht.getCellAt(new Coordinates(1, 2)).setContent('=C1')
    expect(() => sht.getCellAt(new Coordinates(1, 1)).setContent('=B1')).toThrowError()
  })
})
