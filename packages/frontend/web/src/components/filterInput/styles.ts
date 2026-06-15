import styled from 'styled-components'

export const Field = styled.label`
  display: flex;
  flex-direction: column;

  > span {
    color: ${props => props.theme.colors.dark};
    font-size: 0.75rem;
    font-weight: 600;
    margin-bottom: 6px;
  }

  > div {
    align-items: center;
    border: 2px solid ${props => props.theme.colors.mediumTint};
    border-radius: 5px;
    display: flex;
    height: 42px;
    overflow: hidden;

    svg {
      color: ${props => props.theme.colors.mediumShade};
      flex-shrink: 0;
      margin-left: 12px;
    }

    input,
    select {
      background: transparent;
      border: 0;
      color: ${props => props.theme.colors.dark};
      flex: 1;
      font-size: 0.875rem;
      height: 100%;
      min-width: 0;
      outline: 0;
      padding: 0 12px;
    }

    select[multiple] {
      height: auto;
      min-height: 76px;
      padding: 8px 12px;
    }

    input::placeholder {
      color: ${props => props.theme.colors.mediumTint};
    }
  }

  > div[data-multiple='true'] {
    align-items: flex-start;
    height: auto;
  }
`
