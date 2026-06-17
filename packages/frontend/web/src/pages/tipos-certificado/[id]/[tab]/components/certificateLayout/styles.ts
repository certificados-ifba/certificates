import styled from 'styled-components'

export const LayoutContainer = styled.div`
  display: flex;
  > div {
    display: flex;
    flex-direction: column;
    overflow-x: auto;
    margin-right: auto;
    margin-left: auto;
  }
`

export const EditContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.margins.sm};
  margin-bottom: ${props => props.theme.margins.sm};
`
