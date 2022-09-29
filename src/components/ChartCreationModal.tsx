import React, { useEffect, useState } from 'react'
import Modal from './Modal'
import styled from 'styled-components'
import Button from './Button'
import barChart from '../assets/bar-chart.png'
import lineChart from '../assets/line-chart.png'
import Chart, { ChartType } from '../models/Chart'
import { Range } from '../models/types'
import Coordinates from '../models/Coordinates'
import { getIndexOfFirstNumber, letterToAlphabetPosition } from '../utils'
import { ISheet } from '../models/Sheet'

const Header = styled.div`
  padding: 12px;
  border-bottom: 1px solid grey;
`

const HeaderText = styled.div`
  font-size: 30px;
  font-weight: bold;
`

const Body = styled.div`
  padding: 30px 24px;
`

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
`

const RowTitle = styled.div`
  margin-right: 36px;
  font-weight: bold;
  font-size: 20px;
  width: 50%;
`

const ChartRowBody = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`

const ChartImageWrapper = styled.div<{ selected: boolean }>`
  border: 1px solid darkgrey;

  :first-child {
    margin-right: 12px;
  }

  :hover {
    cursor: pointer;
  }

  ${({ selected }) => selected && `background-color: lightgrey;`}
`

const ChartImage = styled.img`
  width: 80px;
  height: 80px;
`

const RangeBody = styled.div`
  font-size: 16px;
  width: 50%;
`

const RangeInput = styled.input``

const BottomRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
`

const StyledButton = styled(Button)`
  margin-right: 16px;
`

const ErrorMessage = styled.p`
  text-align: center;
  color: red;
  margin: 12px;
`

type Props = {
  isOpen: boolean
  onClose: () => void
  sheet: ISheet
}

/**
 * Renders the modal that users will fill out to create a new chart
 */
export const ChartCreationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  sheet,
}) => {
  // state for all of the input fields
  const [type, setType] = useState<ChartType>('bar')
  const [xAxisText, setXAxisText] = useState('')
  const [yAxisText, setYAxisText] = useState('')
  const [title, setTitle] = useState('')
  const [xAxisLabel, setXAxisLabel] = useState('')
  const [yAxisLabel, setYAxisLabel] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  /**
   * This regex tests for cell reference expressions
   * These would all be matched by the regex:
   * * "A3"
   * * "a1..a2"
   * * "b353"
   * * "Z45235..H26"
   *
   * These would not be matched:
   * * "3"
   * * "A2....A535"
   */
  const cellRefRegex = /([a-zA-Z][0-9]+)(?:\.\.([a-zA-Z][0-9]+))/
  const isValidXAxis = cellRefRegex.test(xAxisText)
  const isValidYAxis = cellRefRegex.test(yAxisText)

  // clear input fields when modal is reopened
  useEffect(() => {
    setXAxisText('')
    setYAxisText('')
    setTitle('')
    setXAxisLabel('')
    setYAxisLabel('')
    setErrorMessage('')
  }, [isOpen])

  // clear error message when an input field changes
  useEffect(() => {
    setErrorMessage('')
  }, [
    isOpen,
    xAxisText,
    yAxisText,
    isValidXAxis,
    isValidYAxis,
    title,
    xAxisLabel,
    yAxisLabel,
  ])

  // all fields are required
  const disabled =
    !xAxisText ||
    !yAxisText ||
    !isValidXAxis ||
    !isValidYAxis ||
    !title ||
    !xAxisLabel ||
    !yAxisLabel

  // convert the x or y axis text to a Range object
  const convertTextToRange = (axisText: string): Range => {
    const xCells = axisText.split('..')
    const x1 = xCells[0]
    const indexOfFirstNumber = getIndexOfFirstNumber(x1)
    const col1 = x1.substring(0, indexOfFirstNumber)
    const row1 = parseInt(x1.substring(indexOfFirstNumber))
    const coords1 = new Coordinates(row1, letterToAlphabetPosition(col1))

    if (xCells.length > 1) {
      const x2 = xCells[1]
      const indexOfFirstNumber = getIndexOfFirstNumber(x2)
      const col2 = x2.substring(0, indexOfFirstNumber)
      const row2 = parseInt(x2.substring(indexOfFirstNumber))
      const coords2 = new Coordinates(row2, letterToAlphabetPosition(col2))
      return [coords1, coords2]
    } else {
      return [coords1, coords1]
    }
  }

  // on submit, create a new chart object and add it to the sheet
  const onSubmit = () => {
    setErrorMessage('')

    // error handling

    if (disabled) {
      setErrorMessage(
        'Not all fields are present. Please fill out every field.'
      )
      return
    }

    // get ranges from range input
    const xRange = convertTextToRange(xAxisText)
    const yRange = convertTextToRange(yAxisText)

    if (
      !(
        xRange[0].getCol() === xRange[1].getCol() ||
        xRange[0].getRow() === xRange[1].getRow()
      )
    ) {
      // not a 1D list
      setErrorMessage('X range must be a 1 dimensional list')
      return
    }

    if (
      !(
        yRange[0].getCol() === yRange[1].getCol() ||
        yRange[0].getRow() === yRange[1].getRow()
      )
    ) {
      // not a 1D list
      setErrorMessage('Y range must be a 1 dimensional list')
      return
    }

    const xLength =
      xRange[1].getCol() - xRange[0].getCol() ||
      xRange[1].getRow() - xRange[0].getRow()
    const yLength =
      yRange[1].getCol() - yRange[0].getCol() ||
      yRange[1].getRow() - yRange[0].getRow()
    if (xLength !== yLength) {
      // axes data are not the same length
      setErrorMessage('X range and Y range must be the same length')
      return
    }

    const chart = new Chart(xRange, yRange, type, title, xAxisLabel, yAxisLabel)
    sheet.addChart(chart)
    // close modal once chart is created
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div>
        <Header>
          <HeaderText>Create Chart</HeaderText>
        </Header>
        <Body>
          <Row>
            <RowTitle>Type</RowTitle>
            <ChartRowBody style={{ width: '50%' }}>
              <ChartImageWrapper
                onClick={() => setType('bar')}
                selected={type === 'bar'}
                style={{ padding: 10 }}
              >
                <ChartImage src={barChart} style={{ width: 60, height: 60 }} />
              </ChartImageWrapper>
              <ChartImageWrapper
                onClick={() => setType('line')}
                selected={type === 'line'}
              >
                <ChartImage src={lineChart} />
              </ChartImageWrapper>
            </ChartRowBody>
          </Row>
          <Row>
            <RowTitle>X Axis</RowTitle>
            <RangeBody>
              REF(
              <RangeInput
                placeholder="A1..A4"
                value={xAxisText}
                onChange={(e) => setXAxisText(e.target.value)}
              />
              )
            </RangeBody>
          </Row>
          <Row>
            <RowTitle>Y Axis</RowTitle>
            <RangeBody>
              REF(
              <RangeInput
                placeholder="B1..B4"
                value={yAxisText}
                onChange={(e) => setYAxisText(e.target.value)}
              />
              )
            </RangeBody>
          </Row>
          <Row>
            <RowTitle>Title</RowTitle>
            <RangeBody>
              <RangeInput
                placeholder="My Chart"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </RangeBody>
          </Row>
          <Row>
            <RowTitle>X Axis Label</RowTitle>
            <RangeBody>
              <RangeInput
                placeholder="My X Axis"
                value={xAxisLabel}
                onChange={(e) => setXAxisLabel(e.target.value)}
              />
            </RangeBody>
          </Row>
          <Row>
            <RowTitle>Y Axis Label</RowTitle>
            <RangeBody>
              <RangeInput
                placeholder="My Chart"
                value={yAxisLabel}
                onChange={(e) => setYAxisLabel(e.target.value)}
              />
            </RangeBody>
          </Row>
          {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
          <BottomRow>
            <StyledButton variant="secondary" onClick={onClose}>
              CANCEL
            </StyledButton>
            <Button variant="primary" onClick={onSubmit}>
              CREATE
            </Button>
          </BottomRow>
        </Body>
      </div>
    </Modal>
  )
}
