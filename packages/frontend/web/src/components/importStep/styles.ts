import ReactSelect from 'react-select'
import styled, { css } from 'styled-components'

export const Info = styled.small`
  padding-top: 10px;
  padding-bottom: 10px;
  text-align: center;
  display: block;
`

export const ProgressWrapper = styled.div`
  margin: 20px 0px;
  > i {
    display: flex;
    justify-content: center;
  }
  > h2 {
    text-align: center;
    margin: 8px 0px 16px;
  }
`

export const Pagination = styled.footer`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;

  > div > span,
  > span {
    color: ${props => props.theme.colors.darkShade};
    font-size: 12px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    margin-right: 20px;
  }

  > span {
    flex: 1;
    flex-direction: row-reverse;
  }

  > div {
    align-items: center;
    display: inline-flex;
    > div {
      width: 80px;
      font-size: 12px;
      font-weight: 500;
    }
  }

  nav {
    display: flex;

    button {
      margin-left: 5px;
    }
  }
`

export const PaginateList = styled.div`
  display: flex;
  margin: 0 5px;
  button {
    span {
      font-size: 12px;
      width: 18px;
      font-weight: 400;
      text-align: center;
      display: block;
      color: ${props => props.theme.colors.darkTint};
    }
    &[disabled] {
      opacity: 1;
      span {
        font-weight: 600;
        color: ${props => props.theme.colors.dark};
      }
    }
  }
`

export const PageSizeSelect = styled(ReactSelect)`
  .react-select__control {
    cursor: pointer;
    font-size: 0.875rem;
    border-radius: 5px;
    border: 2px solid ${props => props.theme.colors.mediumTint};
    color: ${props => props.theme.colors.mediumShade};
    &:hover {
      border-color: ${props => props.theme.colors.mediumTint};
      ${props =>
        props.isFilled &&
        css`
          border-color: ${props => props.theme.colors.primary};
        `}
      ${props =>
        props.isErrored &&
        css`
          border-color: ${props => props.theme.colors.danger};
        `}
    }
    ${props =>
      props.isFilled &&
      css`
        border-color: ${props => props.theme.colors.primary} !important;
        color: ${props => props.theme.colors.primary} !important;
      `}
    ${props =>
      props.isErrored &&
      css`
        border-color: ${props => props.theme.colors.danger} !important;
        color: ${props => props.theme.colors.danger} !important;
      `}
  }
  .react-select__option--is-selected {
    color: inherit;
    background: ${props => props.theme.colors.primary};
  }
  .react-select__control--is-focused {
    border-color: ${props => props.theme.colors.secondary};
    color: ${props => props.theme.colors.secondary};
    box-shadow: none;
    &:hover {
      border-color: ${props => props.theme.colors.secondary};
      color: ${props => props.theme.colors.secondary};
    }
  }
  .react-select__control--is-disabled {
    background: ${props => props.theme.colors.lightShade};
    border-color: ${props => props.theme.colors.lightShade};
    .react-select__single-value {
      color: ${props => props.theme.colors.mediumShade};
    }
  }
`
