import styled, { css } from 'styled-components'

export const Header = styled.div`
  display: flex;
  h2 {
    margin-left: 10px;
    display: inline;
    font-size: 1.25rem;
    margin-right: auto;
    margin-top: auto;
    margin-bottom: auto;
  }

  .icon {
    margin-left: 10px;
    display: flex;
    > svg {
      margin-top: auto;
      margin-bottom: auto;
    }
  }

  .edit {
    margin-left: 10px;
  }
  .delete {
    margin-left: auto;
  }
`

export const Container = styled.div`
  border-radius: 10px;
  box-shadow: 0px 0px 3px 0px ${props => props.theme.colors.mediumTint};
  padding: 15px;
`

export interface ImageProps {
  img: string
}

export const ImagePreview = styled.div<ImageProps>`
  border-radius: 5px;
  width: 240px;
  height: 170px;
  ${props =>
    props.img &&
    css`
      background-image: url(${props.img});
      > div {
        display: none;
      }
    `}
  ${props =>
    !props.img &&
    css`
      position: relative;
      background-color: ${props => props.theme.colors.mediumTint};
      > div {
        color: ${props => props.theme.colors.primary};
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: table;
        > div {
          display: table-cell;
          vertical-align: middle;
          text-align: center;
        }
      }
    `}
  background-size: 100% 100%;
  margin-left: auto;
  margin-right: auto;
  @media (max-width: 240px) {
    background-size: auto;
  }
  margin-bottom: 5px;
`

export const Preview = styled.div`
  > div {
    display: flex;
  }
  margin-top: 15px;
  padding: 15px;
  h3 {
    text-align: center;
    margin-bottom: 5px;
  }
  box-shadow: 0px 0px 3px 0px ${props => props.theme.colors.mediumTint};
`
