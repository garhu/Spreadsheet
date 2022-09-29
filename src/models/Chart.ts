import { Range } from './types'
import { v4 } from 'uuid'

/**
 * A type of chart
 */
export type ChartType = 'bar' | 'line'

/**
 * Data object that represents a chart
 */
class Chart {
  private id: string
  constructor(
    private xRange: Range,
    private yRange: Range,
    private type: ChartType,
    private title: string,
    private xLabel: string,
    private yLabel: string
  ) {
    this.id = v4()
  }

  getId(): string {
    return this.id
  }
  getXRange(): Range {
    return this.xRange
  }
  getYRange(): Range {
    return this.yRange
  }
  getType(): ChartType {
    return this.type
  }
  getTitle(): string {
    return this.title
  }
  getXLabel(): string {
    return this.xLabel
  }
  getYLabel(): string {
    return this.yLabel
  }
}

export default Chart
