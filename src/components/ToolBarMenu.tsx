import React, { ReactElement, forwardRef } from 'react'
import { DropdownMenuProvider } from './DropdownMenu'

type ToolBarMenuProps = {
  xPos: number
  yPos: number
  menuComponent: ReactElement
  beOpen: boolean
  class: string
  children: any
}

/**
 * Renders a Dropdown for the toolbar buttons at the top of the app
 */
const ToolBarMenu = forwardRef(
  ({ beOpen, children, xPos, yPos, menuComponent }: ToolBarMenuProps, ref) => {
    return (
      <DropdownMenuProvider
        xPos={xPos}
        yPos={yPos}
        beOpen={beOpen}
        menuComponent={menuComponent}
      >
        {' '}
        {children}{' '}
      </DropdownMenuProvider>
    )
  }
)

export default ToolBarMenu
