import styled, { css } from 'styled-components'

export const Container = styled.header`
  height: 100px;
  width: 100%;
  background-color: ${props => props.theme.colors.lightTint};

  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    z-index: 2;
  }
`

export const Button = styled.button`
  padding: 15px;
  margin: 23px;
  border-radius: 100%;
  border: none;
  background-color: transparent;
  color: ${props => props.theme.colors.mediumShade};
  transition: all 0.25s;
  display: flex;

  :hover {
    background-color: ${props => props.theme.colors.light};
    color: ${props => props.theme.colors.primaryTint};
    box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.05);
  }
`
export const UserInfo = styled.div`
  display: flex;
  align-items: center;
  border-right: 1px solid ${props => props.theme.colors.mediumTint};
  padding: 7px 24px;
`
export const Info = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: end;
  text-transform: capitalize;
  span {
    color: ${props => props.theme.colors.mediumShade};
  }
`
export const Avatar = styled.div`
  min-width: 50px;
  min-height: 50px;
  background: ${props => props.theme.colors.secondaryTint};
  border-radius: 25px;
  justify-content: center;
  align-items: center;
  display: flex;
  margin-left: 14px;
  font-size: 24px;
  color: ${props => props.theme.colors.light};
  font-weight: 600;
  user-select: none;

  :hover {
    filter: brightness(0.9);
  }
`
export const Right = styled.div`
  display: flex;
  align-items: center;
`

export const AvatarDropdown = styled.div<{ active: boolean }>`
  display: none;
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  background: ${props => props.theme.colors.lightTint};
  border-radius: 10px;
  box-shadow: 0px 0px 5px 0px ${props => props.theme.colors.mediumTint};
  padding: ${props => props.theme.margins.sm};
  z-index: 20;
  min-width: 180px;

  ${props =>
    props.active &&
    css`
      display: block;
    `}
`

export const AvatarMenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  border: none;
  background: transparent;
  border-radius: 8px;
  color: ${props => props.theme.colors.mediumShade};
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;
  transition: all 0.2s;

  :hover {
    background: ${props => props.theme.colors.light};
    color: ${props => props.theme.colors.primaryTint};
  }
`
