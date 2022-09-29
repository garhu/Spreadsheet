import React from 'react'
import {
  LineChart,
  Line,
  CartesianGrid,
  YAxis,
  XAxis,
  BarChart,
  Bar,
} from 'recharts'
import styled from 'styled-components'
import IChart from '../models/Chart'
import { ISheet } from '../models/Sheet'
import theme from './theme'

const DeleteButton = styled.div`
  padding: 8px;
  position: absolute;
  top: -30px;
  right: -30px;
  cursor: pointer;
  color: grey;
  font-weight: bold;
  font-size: 18px;
  z-index: 2;
`

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
`

const YAxisLabel = styled.div`
  flex: 1;
  max-width: 100px;
  margin-right: 20px;
  text-align: center;
  transform: translateY(-40%);
`

type Props = {
  chart: IChart
  sheet: ISheet
  index: number
  count: number
  setCount: (num: number) => void
}

// static width required for chart library
const WIDTH = 500
const HEIGHT = 300

/**
 * Renders a chart component that lives in the RightDrawer. Takes in a chart object to render.
 */
export const Chart: React.FC<Props> = ({
  chart,
  sheet,
  index,
  count,
  setCount,
}) => {
  const xCells = [...sheet.getCellRange(chart.getXRange())]
  const yCells = [...sheet.getCellRange(chart.getYRange())]

  // convert the cell display content to the data format required by the charting library
  const data = xCells.map((xCell, i) => {
    const yCell = yCells[i]
    return { name: xCell.getDisplayContent(), value: yCell.getDisplayContent() }
  })

  const axes = (
    <>
      <YAxis dataKey="value" />
      <XAxis
        label={{ value: chart.getXLabel(), dy: 10 }}
        height={40}
        dataKey="name"
      />
    </>
  )

  // render either a bar or a line chart
  let chartComponent = <></>
  if (chart.getType() === 'bar') {
    chartComponent = (
      <BarChart
        width={WIDTH}
        height={HEIGHT}
        data={data}
        style={{ marginLeft: -44 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <Bar dataKey="value" stroke={theme.colors.primary.main} />
        {axes}
      </BarChart>
    )
  } else {
    chartComponent = (
      <LineChart
        width={WIDTH}
        height={HEIGHT}
        data={data}
        style={{ marginLeft: -44 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <Line
          type="monotone"
          dataKey="value"
          stroke={theme.colors.primary.main}
        />
        {axes}
      </LineChart>
    )
  }

  return (
    <Wrapper>
      <YAxisLabel>{chart.getYLabel()}</YAxisLabel>
      {chartComponent}
      {/* handle deletion of a chart */}
      <DeleteButton
        onClick={() => {
          sheet.deleteChartByIndex(index)
          setCount(count + 1)
        }}
      >
        x
      </DeleteButton>
    </Wrapper>
  )
}
