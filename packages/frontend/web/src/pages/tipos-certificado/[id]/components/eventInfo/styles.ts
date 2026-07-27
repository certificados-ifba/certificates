import styled from 'styled-components'

export const Container = styled.div`
  padding: 25px 15px;
  @media (min-width: ${props => props.theme.responsive.smDown}) {
    padding: 30px;
    display: flex;
  }
`

export const ButtonContainer = styled.div`
  margin-left: auto;

  @media (max-width: ${props => props.theme.responsive.smDown}) {
    margin-left: 0;
    margin-top: 30px;
  }
`
