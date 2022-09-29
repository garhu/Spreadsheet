/**
 * Row and column coordinates for referring to cells in a sheet.
 * Coordinates are ALWAYS 1-indexed
 */
class Coordinates {
  constructor(private row: number, private col: number) {}

  getRow(): number {
    return this.row
  }
  getCol(): number {
    return this.col
  }
}

export default Coordinates
