import React from 'react'
import ReactModal from 'react-modal'
import styled from 'styled-components'

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.5);
`

type ModalProps = {
  children: any
  isOpen: boolean
  onClose(): void
}

/**
 * A generic modal component to be used to render content above the document body with a opaque overlay
 */
const Modal = ({ children, isOpen, onClose }: ModalProps) => (
  <ReactModal
    style={{
      content: {
        position: 'absolute',
        inset: '15% 25%',
      },
    }}
    isOpen={isOpen}
    onRequestClose={onClose}
    shouldCloseOnEsc={true}
    overlayElement={(props, contentEl) => {
      const { onClick, onMouseDown } = props
      return (
        <Overlay onClick={onClick} onMouseDown={onMouseDown}>
          {contentEl}
        </Overlay>
      )
    }}
    shouldCloseOnOverlayClick={true}
  >
    {children}
  </ReactModal>
)
export default Modal
