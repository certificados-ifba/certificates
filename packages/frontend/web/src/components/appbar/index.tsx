import { IUser } from '@dtos'
import { useAuth, SidebarContext } from '@providers'
import { capitalize, getRole } from '@utils'
import { useRouter } from 'next/router'
import { useEffect, useCallback, useContext, useState } from 'react'
import { FiLogOut, FiMenu, FiEdit } from 'react-icons/fi'

import { ProfileModal } from '../profileModal'
import { Container, Button, UserInfo, Info, Avatar, Right, AvatarDropdown, AvatarMenuItem } from './styles'

export const Appbar: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const router = useRouter()
  const [user, setUser] = useState<IUser>()
  const { user: userAuth, signOut } = useAuth()

  const { toggleActive } = useContext(SidebarContext)

  const handleSignOut = useCallback(() => {
    setLoading(true)
    signOut()
    setLoading(false)
    router.replace('/login')
  }, [router, signOut])

  useEffect(() => {
    if (!user) {
      setUser(userAuth)
    }
  }, [user, userAuth])

  useEffect(() => {
    setUser(userAuth)
  }, [userAuth])

  useEffect(() => {
    if (!avatarMenuOpen) return
    const handleClick = () => setAvatarMenuOpen(false)
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [avatarMenuOpen])

  return (
    <Container>
      <Button onClick={toggleActive}>
        <FiMenu size={24} />
      </Button>
      <Right>
        <UserInfo className="hide-md-down">
          <Info>
            <b>{capitalize(user?.name)}</b>
            <span>{getRole(user?.role)}</span>
          </Info>
          <div style={{ position: 'relative' }}>
            <Avatar
              onClick={e => {
                e.stopPropagation()
                setAvatarMenuOpen(prev => !prev)
              }}
              style={{ cursor: 'pointer' }}
            >
              {user?.name?.substr(0, 1).toUpperCase()}
            </Avatar>
            <AvatarDropdown active={avatarMenuOpen}>
              <AvatarMenuItem
                onClick={e => {
                  e.stopPropagation()
                  setAvatarMenuOpen(false)
                  setProfileModalOpen(true)
                }}
              >
                <FiEdit size={16} />
                <span>Editar Usuário</span>
              </AvatarMenuItem>
            </AvatarDropdown>
          </div>
        </UserInfo>
        <Button disabled={loading}>
          <FiLogOut size={24} onClick={handleSignOut} />
        </Button>
      </Right>
      <ProfileModal
        openModal={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </Container>
  )
}
