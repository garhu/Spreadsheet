import { ISheet, Sheet } from './Sheet'

/**
 * Represents a spreadsheet application that can have multiple sheets
 */
export interface ISpreadsheet {
  /**
   * Gets the sheets that are part of this spreadsheet
   */
  getSheets(): ISheet[]

  /**
   * Get the index of the active sheet
   */
  getActiveSheetIndex(): number

  /**
   * Sets the active sheet
   * @param idx The active sheet index
   */
  setActiveSheetIndex(idx: number): void

  /**
   * Gets the active sheet
   */
  getActiveSheet(): ISheet

  /**
   * Adds a sheet to this spreadsheet
   * @param sheet The sheet
   */
  addSheet(sheet: ISheet): void

  /**
   * Creates a new sheet with the given name
   * @param name The name
   */
  createSheet(name: string): ISheet

  /**
   * Deletes the given sheet
   * @param sheet The sheet
   */
  deleteSheet(sheet: ISheet): void

  /**
   *
   * @param index Deletes the sheet at the given index
   */
  deleteSheetByIndex(index: number): void

  /**
   * Moves the sheet at "from" index to "to" index
   * @param from The index to move from
   * @param to The index to move to
   */
  reorderSheets(from: number, to: number): ISheet[]
}

/**
 * Basic implementation of spreadsheet. This class is a singleton
 */
export class Spreadsheet implements ISpreadsheet {
  private sheets: ISheet[]
  private activeSheetIndex: number | undefined
  private constructor(
    private sheetDefaultWidth: number,
    private sheetDefaultHeight: number
  ) {
    this.sheets = []
  }

  public static Instance: ISpreadsheet = new Spreadsheet(52, 100)

  getSheets(): ISheet[] {
    return this.sheets
  }

  getActiveSheetIndex(): number {
    return this.activeSheetIndex!
  }

  getActiveSheet(): ISheet {
    return this.sheets[this.activeSheetIndex!]
  }

  createSheet(name: string) {
    return new Sheet(name, this.sheetDefaultWidth, this.sheetDefaultHeight)
  }

  addSheet(sheet: ISheet) {
    if (this.activeSheetIndex === undefined) {
      this.activeSheetIndex = 0
    }
    this.sheets.push(sheet)
  }

  deleteSheet(sheet: ISheet) {
    const idx = this.sheets.findIndex((sht) => sht === sheet)
    if (idx < 0) {
      return
    }
    this.sheets.splice(idx, 1)
  }

  // mutate the sheets order and also return the result
  reorderSheets(from: number, to: number): ISheet[] {
    const newOrder = [...this.sheets]
    const movedItem = newOrder.splice(from, 1)[0]
    newOrder.splice(to, 0, movedItem)
    this.sheets = newOrder
    return this.sheets
  }

  deleteSheetByIndex(index: number) {
    this.sheets.splice(index, 1)
  }

  setActiveSheetIndex(index: number) {
    this.activeSheetIndex = index
  }
}
