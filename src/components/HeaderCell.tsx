import styled from 'styled-components'

const StyledTH = styled.th`
  min-width: 5rem;
  height: 2rem;
  border: 1px solid gray;
  border-left: none;
  border-top: none;
  padding: 0.25rem 0.5rem;
  position: sticky;
  top: 35px;
  background-color: lightGray;
`

type CellProps = {
  children?: any
  className?: string
}

/**
 * Renders a cell that contains the label for the row/column
 * Not editable
 */
const HeaderCell = ({ children, className }: CellProps) => {
  return <StyledTH className={className}>{children}</StyledTH>
}

export default HeaderCell
