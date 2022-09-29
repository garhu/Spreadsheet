import { ISheet } from './Sheet'
import Coordinates from './Coordinates'
import * as CSVString from 'csv-string'
import { Spreadsheet } from './Spreadsheet'

/**
 * Utilities for importing CSV to sheet and exporting Sheet to CSV
 */
export default class CSV {
  /**
   * Imports the given CSV content into a sheet with the name sheetName
   * @param text The CSV data
   * @param sheetName The sheet name
   * @returns The newly created sheet
   */
  static import(text: string, sheetName: string): ISheet {
    // create a 2d array representing each cell
    const array = CSVString.parse(text) // using a library here to handle all special cases (eg. byte encoded csvs, csvs with a comma in a cell of the table, etc)

    const sheet = Spreadsheet.Instance.createSheet(sheetName)
    array.forEach((row, i) => {
      row.forEach((cell, j) => {
        sheet.getCellAt(new Coordinates(i + 1, j + 1)).setContent(cell)
      })
    })
    return sheet
  }

  /**
   * Exports the given sheet and forces a user download of the CSV
   * @param sheet The sheet
   */
  static export(sheet: ISheet): void {
    const range = sheet.getCellRangeWithData()
    const csvText = Array.from(Array(range.getHeight()))
      .map((_, row) => {
        return [...range.getSubRange(row, 0, range.getWidth(), 1)]
          .map((cell) => {
            return String(cell.getDisplayContent())
          })
          .join(',')
      })
      .join('\n')

    // gathered from https://stackoverflow.com/questions/44656610/download-a-string-as-txt-file-in-react/44661948
    const element = document.createElement('a')
    const file = new Blob([csvText], {
      type: 'text/plain',
    })
    element.href = URL.createObjectURL(file)
    element.download = `${sheet.getName()}.csv`
    document.body.appendChild(element) // Required for this to work in FireFox
    element.click()
  }
}
