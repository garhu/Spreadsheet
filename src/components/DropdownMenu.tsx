import React, { ReactElement, useState } from 'react'
import { MenuContainer } from './ContextMenu'

type DropdownMenuProviderProps = {
  children: any
  menuComponent: ReactElement
  xPos: number
  yPos: number
  beOpen: boolean
}

/**
 * Provides the context to properly render a DropdownMenu
 */
const DropdownMenuProvider = ({
  children,
  menuComponent,
  xPos,
  yPos,
  beOpen,
}: DropdownMenuProviderProps) => {
  const [showMenu, setShowMenu] = useState(beOpen)
  const [isOpen, setIsOpen] = useState(beOpen)
  const [menuCoords, setMenuCoords] = useState([xPos, yPos])

  if (!isOpen && !showMenu && beOpen) {
    setShowMenu(true)
    setTimeout(() => setIsOpen(true), 50) // Timeouts are to get the opacity transition to show up
  } else if (isOpen && showMenu && !beOpen) {
    setIsOpen(false)
    setTimeout(() => setShowMenu(false), 200)
  }

  return (
    <div>
      {showMenu ? (
        <MenuContainer
          xPos={menuCoords[0]}
          yPos={menuCoords[1]}
          isOpen={isOpen}
        >
          {menuComponent}
        </MenuContainer>
      ) : null}
      {children}
    </div>
  )
}

export { DropdownMenuProvider }
