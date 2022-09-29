import React from 'react'
import styled from 'styled-components'
import theme from './theme'

// this is a div because drag and drop does not work with html button components
const StyledHTMLButton = styled.div<{ disabled?: boolean; variant: string }>`
  appearance: none;
  border: none;
  border-radius: 0.25rem;
  text-transform: uppercase;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;

  min-width: 5rem;
  height: 2rem;

  transition: all 0.2s ease;

  font-weight: 500;

  ${(props) => {
    if (props.variant === 'primary') {
      return `
                background-color: ${theme.colors.primary.main};
                color: ${theme.colors.secondary.main};

                &:active {
                    background-color: ${theme.colors.primary.surfaceActive};
                }
            `
    } else if (props.variant === 'secondary') {
      return `
                background-color: ${theme.colors.secondary.main};
                color: ${theme.colors.primary.main};
                border: 1px solid ${theme.colors.primary.main};

                &:active {
                    background-color: ${theme.colors.secondary.surfaceActive};
                }
            `
    } else if (props.variant === 'unselected') {
      return `
                background-color: ${theme.colors.inactive.surfaceActive};
                color: ${theme.colors.primary.main};
                border: 1px solid ${theme.colors.primary.main};

                &:active {
                    background-color: ${theme.colors.inactive.surfaceActive};
                }
            `
    } else if (props.variant === 'sheet-primary') {
      return `
                
                text-transform: none;
                background-color: ${theme.colors.primary.main};
                color: ${theme.colors.secondary.main};
                align: left;

                &:active {
                    background-color: ${theme.colors.primary.surfaceActive};
                }
            `
    } else if (props.variant === 'sheet-secondary') {
      return `
                text-transform: none;
                background-color: ${theme.colors.secondary.main};
                color: ${theme.colors.primary.main};
                border: 1px solid ${theme.colors.primary.main};
                align: left;

                &:active {
                    background-color: ${theme.colors.secondary.surfaceActive};
                }
            `
    }
  }}

  ${({ disabled }) => disabled && `background-color: lightgrey`}
`

type ButtonProps = {
  children: any
  className?: string
  variant?: string
  disabled?: boolean
  onClick?(e: any): void
  onContextMenu?(e: any): void
}

/**
 * Renders a generic multi-purpose button with numerous different variants to be used throughout the app
 */
const Button = ({
  children,
  className,
  variant = 'primary',
  disabled,
  onClick,
  onContextMenu,
  ...props
}: ButtonProps & React.ButtonHTMLAttributes<HTMLDivElement>) => (
  <StyledHTMLButton
    variant={variant}
    className={className}
    onClick={onClick}
    disabled={disabled}
    onContextMenu={onContextMenu}
    {...props}
  >
    {children}
  </StyledHTMLButton>
)

export default Button
