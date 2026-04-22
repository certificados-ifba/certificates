import {
  Alert,
  Button,
  Card,
  Column,
  Container,
  DeleteModal,
  Header,
  Input,
  PaginatedTable,
  Tooltip
} from '@components'
import { TableRow } from '@components/tableRow'
import { withAuth } from '@hocs'
import { useToast } from '@providers'
import { api, usePaginatedRequest } from '@services'
import { theme } from '@styles'
import { Form } from '@unform/web'
import { getRole, maskEmail } from '@utils'
import Head from 'next/head'
import { useCallback, useState } from 'react'
import {
  FiEdit,
  FiLock,
  FiMail,
  FiPlus,
  FiSearch,
  FiSend,
  FiTrash2,
  FiUnlock,
  FiUsers
} from 'react-icons/fi'

import { UserModal } from './components'

const Users: React.FC = () => {
  const [user, setUser] = useState(null)
  const [filters, setFilters] = useState(null)
  const [openUserModal, setOpenUserModal] = useState(false)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [column, setColumn] = useState('name')
  const [order, setOrder] = useState<'' | 'ASC' | 'DESC'>('ASC')
  const [typeModal, setTypeModal] = useState<'update' | 'add' | 'update-email'>(
    null
  )

  const request = usePaginatedRequest<any>({
    url: 'users',
    params:
      filters && order !== ''
        ? Object.assign(filters, { sort_by: column, order_by: order })
        : order !== ''
          ? { sort_by: column, order_by: order }
          : filters
  })

  const { addToast } = useToast()

  const handleResendMail = useCallback(
    async id => {
      try {
        await api.get(`users/${id}/resend`)
        addToast({
          title: 'E-mail reenviado',
          type: 'success',
          description: 'Peça para o usuário verificar a caixa de mensagens.'
        })
      } catch (err) {
        addToast({
          title: 'Erro no reenvio',
          type: 'error',
          description: err
        })
      }
    },
    [addToast]
  )

  const handleSubmitDelete = useCallback(async () => {
    try {
      await api.delete(`users/${user.id}`)
      addToast({
        title: 'Usuário excluido',
        type: 'success',
        description: `${user.name} excluído com sucesso.`
      })
      request.revalidate()
      setOpenDeleteModal(false)
    } catch (err) {
      addToast({
        title: 'Erro na exclusão',
        type: 'error',
        description: err
      })
    }
  }, [addToast, request, user])

  const handleFilter = useCallback(
    data => {
      !data.search && delete data.search
      request.resetPage()
      setFilters(data)
    },
    [request]
  )

  const handleOrder = useCallback(
    columnSelected => {
      if (column !== columnSelected) {
        setColumn(columnSelected)
        setOrder('ASC')
      } else {
        setOrder(value =>
          value === '' ? 'ASC' : value === 'ASC' ? 'DESC' : ''
        )
      }
    },
    [column]
  )
  const handleCloseUserModal = useCallback(() => {
    setOpenUserModal(false)
  }, [])

  const handleCloseDeleteModal = useCallback(() => {
    setOpenDeleteModal(false)
  }, [])

  return (
    <Container>
      <Head>
        <title>Usuários | Certificados</title>
      </Head>
      <Header
        title="Usuários"
        subtitle="São pessoas que terão acesso gerencial ao sistema"
        icon={FiUsers}
        controls={
          <nav>
            <Button
              onClick={() => {
                setUser(null)
                setTypeModal('add')
                setOpenUserModal(true)
              }}
            >
              <FiPlus size={20} />
              <span className="hide-md-down">Adicionar Usuário</span>
            </Button>
          </nav>
        }
      />
      <Card>
        <header>
          <h2>Usuários cadastrados</h2>
          <Form onSubmit={handleFilter}>
            <Input name="search" placeholder="Buscar usuário" icon={FiSearch} />
          </Form>
        </header>
        <PaginatedTable request={request}>
          <thead>
            <tr>
              <th onClick={() => handleOrder('name')}>
                <Column order={order} selected={column === 'name'}>
                  Nome
                </Column>
              </th>
              <th onClick={() => handleOrder('email')}>
                <Column order={order} selected={column === 'email'}>
                  E-mail
                </Column>
              </th>
              <th onClick={() => handleOrder('role')}>
                <Column order={order} selected={column === 'role'}>
                  Tipo
                </Column>
              </th>
              <th onClick={() => handleOrder('last_login')}>
                <Column order={order} selected={column === 'last_login'}>
                  Acesso
                </Column>
              </th>
              <th style={{ width: 32 }} />
            </tr>
          </thead>
          <tbody>
            {request.data?.data?.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{maskEmail(user.email)}</td>
                <td>{getRole(user.role)}</td>
                <td>
                  <TableRow>
                    {user.is_confirmed ? (
                      <FiUnlock size={20} color={theme.colors.success} />
                    ) : (
                      <FiLock size={20} color={theme.colors.danger} />
                    )}
                    <span>
                      {user.last_login
                        ? `Acessou em ${new Date(
                          user.last_login
                        ).toLocaleDateString()} às ${new Date(
                          user.last_login
                        ).toLocaleTimeString()}`
                        : 'Nunca acessou'}
                    </span>
                  </TableRow>
                </td>
                <td>
                  <TableRow>
                    <Tooltip title="Reenviar e-mail">
                      <Button
                        inline
                        ghost
                        square
                        color="primary"
                        size="small"
                        onClick={() => handleResendMail(user.id)}
                      >
                        <FiSend size={20} />
                      </Button>
                    </Tooltip>
                    <Tooltip title="Atualizar e-mail">
                      <Button
                        inline
                        ghost
                        square
                        color="warning"
                        size="small"
                        onClick={() => {
                          setUser(user)
                          setTypeModal('update-email')
                          setOpenUserModal(true)
                        }}
                      >
                        <FiMail size={20} />
                      </Button>
                    </Tooltip>
                    <Tooltip title="Editar">
                      <Button
                        inline
                        ghost
                        square
                        color="secondary"
                        size="small"
                        onClick={() => {
                          setUser(user)
                          setTypeModal('update')
                          setOpenUserModal(true)
                        }}
                      >
                        <FiEdit size={20} />
                      </Button>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <Button
                        inline
                        ghost
                        square
                        color="danger"
                        size="small"
                        onClick={() => {
                          setUser(user)
                          setOpenDeleteModal(true)
                        }}
                      >
                        <FiTrash2 size={20} />
                      </Button>
                    </Tooltip>
                  </TableRow>
                </td>
              </tr>
            ))}
          </tbody>
        </PaginatedTable>
      </Card>
      <UserModal
        request={request}
        openModal={openUserModal}
        onClose={handleCloseUserModal}
        type={typeModal}
        user={user}
      />
      <DeleteModal
        name="Usuário"
        openModal={openDeleteModal}
        onClose={handleCloseDeleteModal}
        handleSubmit={handleSubmitDelete}
      >
        <Alert marginBottom="sm">
          Tem certeza que você deseja excluir o usuário de <b>{user?.name}</b>?
        </Alert>
        <Alert size="sm" icon={FiMail}>
          <b>{user?.email}</b>
        </Alert>
      </DeleteModal>
    </Container>
  )
}

export default withAuth(Users, true)
