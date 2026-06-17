import styled from 'styled-components'

export const Container = styled.div`
  padding: 25px 15px;
  @media (min-width: ${props => props.theme.responsive.smDown}) {
    padding: 30px;
  }
  > :nth-child(n):not(:last-child) {
    margin-bottom: 1rem;
  }
`
