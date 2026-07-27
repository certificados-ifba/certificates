import styled from 'styled-components'

export const Participants = styled.div<{ color: 'danger' | 'success' }>`
  min-width: 180px;
  display: flex;
  svg {
    color: ${props => props.theme.colors[props.color]};
  }
  span {
    display: flex;
    margin-left: 10px;
    margin-top: auto;
    margin-bottom: auto;
  }
`
