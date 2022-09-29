import React, { useEffect, useState } from 'react'
import { Drawer } from 'rsuite'
import { ISheet } from '../models/Sheet'
import { Chart } from './Chart'
import styled from 'styled-components'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from 'react-beautiful-dnd'

const ChartTitle = styled.p`
  font-size: 24px;
  font-weight: bold;
`

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
  sheet: ISheet
}

/**
 * Renders the RightDrawer that contains all of the charts. Takes the effect of a Modal but it is rendered on the right half of the screen.
 */
export const RightDrawer: React.FC<Props> = ({ open, setOpen, sheet }) => {
  const [charts, setCharts] = useState(sheet.getCharts())
  const [count, setCount] = useState(0)
  const [orderOfCharts, setOrderOfCharts] = useState<string[]>([]) // list of chart ids

  // when a sheet's charts change, align the orderOfCharts array with the list of charts
  useEffect(() => {
    setCharts(sheet.getCharts())

    const newOrder = [...orderOfCharts]
    const allChartIds = sheet.getCharts().map((c) => c.getId())
    // add all new charts to the chart order
    for (const chart of sheet.getCharts()) {
      if (!newOrder.includes(chart.getId())) {
        newOrder.push(chart.getId())
      }
    }
    // remove all removed charts from the chart order
    for (const id of newOrder) {
      if (!allChartIds.includes(id)) {
        newOrder.splice(newOrder.indexOf(id), 1)
      }
    }
    setOrderOfCharts(newOrder)
  }, [sheet.getCharts(), open])

  // update the orderOfCharts moving the item that was moved
  const onDragEnd = (result: DropResult) => {
    // dropped outside the list
    if (!result.destination) {
      return
    }

    const newOrder = [...orderOfCharts]
    const movedItem = newOrder.splice(result.source.index, 1)[0]
    newOrder.splice(result.destination.index, 0, movedItem)
    setOrderOfCharts(newOrder)
  }

  // sort the list of charts based on the order of the ids
  const orderMap: { [id: string]: number } = {}
  for (let i = 0; i < orderOfCharts.length; i++) {
    orderMap[orderOfCharts[i]] = i
  }
  const sortedCharts = charts.sort(
    (a, b) => orderMap[a.getId()] - orderMap[b.getId()]
  )

  return (
    <Drawer open={open} onClose={() => setOpen(false)} size="sm">
      <Drawer.Header>
        <Drawer.Title>Charts for {sheet.getName()}</Drawer.Title>
      </Drawer.Header>
      <Drawer.Body>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided, snapshot) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {sortedCharts.map((chart, i) => {
                  return (
                    <Draggable
                      key={chart.getId()}
                      draggableId={chart.getId()}
                      index={i}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...provided.draggableProps.style,
                            top: 'auto !important',
                            left: 'auto !important',
                            border: snapshot.isDragging
                              ? '1px solid black'
                              : 'none',
                          }}
                        >
                          <ChartTitle>{chart.getTitle()}</ChartTitle>
                          <Chart
                            chart={chart}
                            sheet={sheet}
                            index={i}
                            count={count}
                            setCount={setCount}
                          />
                        </div>
                      )}
                    </Draggable>
                  )
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </Drawer.Body>
    </Drawer>
  )
}
