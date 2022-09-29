import React, { useEffect, useState } from 'react'
import Modal from './Modal'
import styled from 'styled-components'
import Button from './Button'
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
`

const InputBody = styled.div`
  font-size: 16px;
`

const NameInput = styled.input``

const BottomRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
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
  sheetNames: string[]
  onRename: (newName: string) => void
}

/**
 * Renders a modal to rename a sheet tab
 */
export const RenameSheetModal: React.FC<Props> = ({
  isOpen,
  onClose,
  sheet,
  sheetNames,
  onRename,
}) => {
  const [newSheetName, setNewSheetName] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // clear input field contents on open/close
  useEffect(() => {
    setNewSheetName('')
    setErrorMessage('')
  }, [isOpen])

  // clear error message on content change
  useEffect(() => {
    setErrorMessage('')
  }, [newSheetName])

  // rename the sheet on submit
  const onSubmit = () => {
    setErrorMessage('')

    if (!newSheetName) {
      setErrorMessage('Please enter a new name for the sheet.')
      return
    }

    for (let i = 0; i < sheetNames.length; i++)
      if (newSheetName.toLowerCase() === sheetNames[i]) {
        setErrorMessage('Another sheet already has this name.')
        return
      }

    sheet.rename(newSheetName)
    onRename(newSheetName)

    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div>
        <Header>
          <HeaderText>Rename Sheet</HeaderText>
        </Header>
        <Body>
          <Row>
            <RowTitle>New Sheet Name:</RowTitle>
            <InputBody>
              <NameInput
                placeholder="Enter new name"
                onChange={(e) => setNewSheetName(e.target.value)}
              />
            </InputBody>
          </Row>
          {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
          <BottomRow>
            <StyledButton variant="secondary" onClick={onClose}>
              CANCEL
            </StyledButton>
            <Button variant="primary" onClick={onSubmit}>
              RENAME
            </Button>
          </BottomRow>
        </Body>
      </div>
    </Modal>
  )
}
