import React, {
  forwardRef,
  ReactElement,
  useState,
  useEffect,
  ReactHTML,
} from 'react'
import { ComponentClass } from 'react'
import { FunctionComponent } from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'
import theme from './theme'

const ContextMenuItemContainer = styled.div`
  padding: 0.5rem 0.25rem;
  background-color: rgba(0, 0, 0, 0);
  transition: all 0.2s ease;
  cursor: pointer;
  &:hover {
    background-color: ${theme.colors.primary.main}33;
  }
  &:active {
    background-color: ${theme.colors.primary.main}66;
  }
`

/**
 * Renders a single button item in the context menu
 */
const ContextMenuItem = ({
  title,
  onClick,
  closeMenuOnClick,
}: {
  title: string
  onClick: (e: any) => void
  closeMenuOnClick: boolean
}) => (
  <ContextMenuItemContainer
    onClick={(e) => {
      onClick(e)
      if (closeMenuOnClick) {
        document.dispatchEvent(new Event('closespreadsheetcontextmenu'))
      }
    }}
  >
    {title}
  </ContextMenuItemContainer>
)

const ContextMenuContainer = styled.div`
  padding: 0;
  margin: 0;
  min-width: 150px;
  height: auto;
  background-color: white;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
`

const ContextMenu = forwardRef(({ children }: { children: any }, ref) => (
  //@ts-ignore
  <ContextMenuContainer ref={ref}>{children}</ContextMenuContainer>
))

type ContextMenuProviderProps = {
  children: any
  menuComponent: ReactElement
  containerElement?:
    | keyof ReactHTML
    | FunctionComponent<{}>
    | ComponentClass<{}, any>
  yOffset?: number
}

const MenuContainer = styled.div`
  position: fixed;
  z-index: 9999;
  top: ${(props: { xPos: number; yPos: number; isOpen: boolean }) =>
    props.yPos}px;
  left: ${(props: { xPos: number; yPos: number; isOpen: boolean }) =>
    props.xPos}px;
  transition: all 0.2s ease;
  width: auto;
  height: auto;
  opacity: ${(props: { isOpen: boolean }) => (props.isOpen ? '1.0' : '0.0')};
`

/**
 * Provides the context to render a context menu
 */
const ContextMenuProvider = ({
  children,
  menuComponent,
  containerElement = 'div',
  yOffset,
}: ContextMenuProviderProps) => {
  const [showMenu, setShowMenu] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [menuCoords, setMenuCoords] = useState([0, 0])

  // close the context menu
  const close = () => {
    hideContextMenu()
    setIsOpen(false)
    setTimeout(() => setShowMenu(false), 200)
  }

  const handleOnClick = (e: any) => {
    e.preventDefault()
    e.stopPropagation()
    close()
  }

  const renderContextMenu = () => {
    // render manually via the ReactDOM
    ReactDOM.render(
      <MenuContainer
        xPos={menuCoords[0]}
        yPos={menuCoords[1]}
        isOpen={true}
        onContextMenu={(e) => {
          e.preventDefault()
        }}
      >
        {menuComponent}
      </MenuContainer>,
      document.getElementById('contextmenu')
    )
  }

  // clear the rendered context menu
  const hideContextMenu = () => {
    ReactDOM.render(<></>, document.getElementById('contextmenu'))
  }

  // attach and detach event listeners for various events
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('click', handleOnClick)
      document.addEventListener('spreadsheetcontextmenu', handleOnClick)
      document.addEventListener('closespreadsheetcontextmenu', close)
    } else {
      document.removeEventListener('click', handleOnClick)
      document.removeEventListener('spreadsheetcontextmenu', handleOnClick)
      document.removeEventListener('closespreadsheetcontextmenu', close)
    }
    return () => {
      document.removeEventListener('click', handleOnClick)
      document.removeEventListener('spreadsheetcontextmenu', handleOnClick)
      document.removeEventListener('closespreadsheetcontextmenu', close)
    }
  }, [handleOnClick, isOpen])

  // render or hide context menu depending on isOpen state
  useEffect(() => {
    if (isOpen) {
      renderContextMenu()
    } else {
      hideContextMenu()
    }
  }, [isOpen, menuCoords])

  // React.createElement is required to render a dynamic `containerElement` html element
  return React.createElement(
    containerElement,
    {
      // @ts-ignore
      onContextMenu: (e: any) => {
        e.preventDefault()
        if (yOffset != null) {
          setMenuCoords([e.clientX, e.clientY - yOffset])
        } else {
          setMenuCoords([e.clientX, e.clientY])
        }
        setShowMenu(true)
        setTimeout(() => setIsOpen(true), 50) // Timeouts are to get the opacity transition to show up

        document.removeEventListener('spreadsheetcontextmenu', handleOnClick)
        document.dispatchEvent(new Event('spreadsheetcontextmenu'))
        document.addEventListener('spreadsheetcontextmenu', handleOnClick)
      },
      onClick: close,
    },
    <>{children}</>
  )
}

export { ContextMenuProvider, ContextMenu, ContextMenuItem, MenuContainer }
