import Observer from './interfaces/Observer'
import Subject from './interfaces/Subject'
import {
  ICellContent,
  CellContentVisitor,
  CellFormulaContents,
  CellTextContents,
} from './CellContent'
import { ISheet } from './Sheet'

/**
 * Represents a generic spreadsheet cell that is capable of holding content
 * This cell is a subject, and observers are notified of updates to the cell's display contents.
 * This cell is also an observer, and can be made to observe other cells' updates.
 */
export interface ICell extends Subject<string>, Observer<string> {
  /**
   * Sets the sheet that "owns" this cell
   * @param sheet The sheet
   */
  setOwningSheet(sheet: ISheet): void

  /**
   * Gets the display content of this cell
   */
  getDisplayContent(): string

  /**
   * Gets the raw content of this cell
   */
  getRawContent(): string

  /**
   * Clears the contents of this cell
   */
  clearContents(): void

  /**
   * Retrieves the underlying content object of this cell
   */
  getContent(): ICellContent | undefined

  /**
   * Sets the content of this cell
   * @param content The content
   */
  setContent(content: string): void

  /**
   * Accepts a visitor on behalf of the underlying cell content
   * @param visitor The visitor
   */
  visitContent<T>(visitor: CellContentVisitor<T>): T | undefined

  /**
   * Factory method for creating cell contents
   * @param rawText The raw text that is to be converted into cell contents
   */
  createContent(rawText: string): ICellContent
}

export class Cell implements ICell {
  private sheet: ISheet | undefined // The cell needs to know what sheet it is in so that it can link up with other cells
  private content: ICellContent | undefined
  private observers: Observer<string>[]

  constructor(content: string, sheet?: ISheet) {
    this.observers = []
    this.sheet = sheet
    this.setContent(content)
  }

  getContent(): ICellContent | undefined {
    return this.content
  }

  createContent(rawText: string): ICellContent {
    if (rawText.startsWith('=')) {
      return new CellFormulaContents(rawText.substring(1), this.sheet!)
    } else {
      return new CellTextContents(rawText)
    }
  }

  setOwningSheet(sheet: ISheet) {
    this.sheet = sheet
  }

  getDisplayContent(): string {
    return this.content!.getDisplayValue()
  }

  getRawContent(): string {
    return this.content!.getRawValue()
  }

  clearContents() {
    this.setContent('')
  }

  setContent(rawContent: string) {
    const newContent = this.createContent(rawContent)
    
    // Loop to detach old observers
    this.content?.getReferencedCellRanges().forEach((ref) => {
      if (!this.sheet) {
        throw new Error(
          'Owning sheet must be set for cell references to work properly'
        )
      }
      const cells = this.sheet!.getCellRange(ref)
      for (let cell of cells) {
        cell.detachObserver(this)
      }
    })

    const oldContent = this.content
    this.content = newContent

    // breadth-first search over cell references to check for cycles
    const queue: ICell[] = [this]
    const seenBefore: ICell[] = []
    while (queue.length > 0) {
      const next = queue.shift()!
      if (seenBefore.length > 0 && next === this) {
        this.content = oldContent
        throw new Error("The entered formula creates a cycle of cell references. The change that caused this was undone.")
      }
      if (seenBefore.includes(next)) {
        continue
      }
      seenBefore.push(next)
      next.getContent()?.getReferencedCellRanges().forEach((ref) => {
        if (!this.sheet) {
          throw new Error(
            'Owning sheet must be set for cell references to work properly'
          )
        }
        queue.push(...this.sheet!.getCellRange(ref))
      });
    }


    // Establish new dependency relationships
    this.content.getReferencedCellRanges().forEach((ref) => {
      if (!this.sheet) {
        throw new Error(
          'Owning sheet must be set for cell references to work properly'
        )
      }
      const cells = this.sheet!.getCellRange(ref)
      for (let cell of cells) {
        cell.attachObserver(this)
      }
    })

    this.handleUpdate()
  }

  attachObserver(observer: Observer<string>) {
    this.observers.push(observer)
  }

  detachObserver(observer: Observer<string>) {
    const idx = this.observers.findIndex((obs) => obs === observer)
    if (idx >= 0) {
      this.observers.splice(idx, 1)
    }
  }

  handleUpdate() {
    this.observers.forEach((obs) => {
      obs.handleUpdate(this.getDisplayContent())
    })
  }

  visitContent<T>(visitor: CellContentVisitor<T>): T | undefined {
    return this.content?.accept(visitor)
  }
}

export default Cell
