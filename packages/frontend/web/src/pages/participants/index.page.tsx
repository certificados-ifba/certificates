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
  TableRow,
  Tooltip
} from '@components'
import { withAuth } from '@hocs'
import { useAuth, useToast } from '@providers'
import { api, usePaginatedRequest } from '@services'
import { theme } from '@styles'
import { Form } from '@unform/web'
import { maskEmail } from '@utils'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import {
  FiEdit,
  FiFilePlus,
  FiMail,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiUnlock,
  FiUserCheck
} from 'react-icons/fi'

import { ParticipantModal } from './components'

const maskCpf = (cpf: string): string => {
  if (!cpf) return ''
  const clean = cpf.replace(/\D/g, '')
  if (clean.length !== 11) return cpf
  return `***.${clean.slice(3, 6)}.${clean.slice(6, 9)}-**`
}

const maskDob = (dob: string): string => {
  if (!dob) return ''
  const str = String(dob)
  // Formato ISO: YYYY-MM-DD ou YYYY-MM-DDTHH:...
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return `${str.slice(8, 10)}/${str.slice(5, 7)}/****`
  }
  // Formato DD/MM/YYYY ou DD-MM-YYYY
  if (str.length >= 6) {
    return str.substring(0, 6) + '****'
  }
  return '****'
}

const Participants: React.FC = () => {
  const [show, setShow] = useState(false)
  const [participant, setParticipant] = useState(null)
  const [filters, setFilters] = useState(null)
  const [openParticipantModal, setOpenParticipantModal] = useState(false)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [column, setColumn] = useState('name')
  const [order, setOrder] = useState<'' | 'ASC' | 'DESC'>('ASC')
  const [typeModal, setTypeModal] = useState<'update' | 'add'>(null)
  const { addToast } = useToast()
  const { isAdmin } = useAuth()

  const handleResendMail = useCallback(
    async id => {
      try {
        await api.get(`users/${id}/resend`)
        addToast({
          title: 'E-mail reenviado',
          type: 'success',
          description: 'Peça para o participante verificar a caixa de mensagens.'
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

  const request = usePaginatedRequest<any>({
    url: 'participants',
    params:
      filters && order !== ''
        ? Object.assign(filters, { sort_by: column, order_by: order })
        : order !== ''
          ? { sort_by: column, order_by: order }
          : filters
  })

  const handleSubmitDelete = useCallback(async () => {
    try {
      await api.delete(`participants/${participant.id}`)
      addToast({
        title: 'Participante excluido',
        type: 'success',
        description: `${participant.name} excluído com sucesso.`
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
  }, [addToast, request, participant])

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

  const handleCloseParticipantModal = useCallback(() => {
    setOpenParticipantModal(false)
  }, [])

  const handleCloseDeleteModal = useCallback(() => {
    setOpenDeleteModal(false)
  }, [])

  useEffect(() => {
    if (!show) {
      setShow(isAdmin)
    }
  }, [show, isAdmin])

  const router = useRouter()

  return (
    <Container>
      <Head>
        <title>Participantes | Certificados</title>
      </Head>
      <Header
        title="Participantes"
        subtitle="Todas as pessoas que participaram ou participarão de eventos"
        icon={FiUserCheck}
        controls={
          <nav>
            <Button
              onClick={() => {
                setParticipant(null)
                setTypeModal('add')
                setOpenParticipantModal(true)
              }}
            >
              <FiPlus size={20} />
              <span className="hide-md-down">Adicionar Participante</span>
            </Button>
          </nav>
        }
      />
      <Card>
        <header>
          <h2>Participantes cadastrados</h2>
          <Form onSubmit={handleFilter}>
            <Input
              name="search"
              placeholder="Buscar participante"
              icon={FiSearch}
            />
          </Form>
          <Button
            inline
            color="info"
            size="small"
            onClick={() => router.push('/participants/import')}
          >
            <FiFilePlus size={20} />
            <span>Importar via Planilha</span>
          </Button>

        </header>
        <PaginatedTable request={request}>
          <thead>
            <tr>
              <th onClick={() => handleOrder('name')}>
                <Column order={order} selected={column === 'name'}>
                  Nome
                </Column>
              </th>
              <th onClick={() => handleOrder('personal_data.cpf')}>
                <Column order={order} selected={column === 'personal_data.cpf'}>
                  CPF
                </Column>
              </th>
              <th onClick={() => handleOrder('personal_data.dob')}>
                <Column order={order} selected={column === 'personal_data.dob'}>
                  Data de Nascimento
                </Column>
              </th>
              <th onClick={() => handleOrder('email')}>
                <Column order={order} selected={column === 'email'}>
                  E-mail
                </Column>
              </th>
              <th onClick={() => handleOrder('personal_data.phone')}>
                <Column
                  order={order}
                  selected={column === 'personal_data.phone'}
                >
                  Telefone
                </Column>
              </th>
              <th onClick={() => handleOrder('personal_data.institution')}>
                <Column
                  order={order}
                  selected={column === 'personal_data.institution'}
                >
                  É da Instituição?
                </Column>
              </th>
              <th onClick={() => handleOrder('updated_at')}>
                <Column order={order} selected={column === 'updated_at'}>
                  Atualizado em
                </Column>
              </th>
              <th>E-mail confirmado</th>
              {show && <th style={{ width: 32 }} />}
            </tr>
          </thead>
          <tbody>
            {request.data?.data?.map(participant => (
              <tr key={participant.id}>
                <td>{participant.name}</td>
                <td>{maskCpf(participant.personal_data.cpf)}</td>
                <td>{maskDob(participant.personal_data.dob)}</td>
                <td>{maskEmail(participant.email)}</td>
                <td>{participant.personal_data.phone}</td>
                <td>{participant.personal_data.institution ? 'Sim' : 'Não'}</td>
                <td>{new Date(participant.updated_at).toLocaleString()}</td>
                <td>
                  {participant.email ? (
                    participant.is_confirmed ? (
                      <TableRow>
                        <FiUnlock size={16} color={theme.colors.success} />
                        <span style={{ color: theme.colors.success, fontSize: 13 }}>
                          Confirmado
                        </span>
                      </TableRow>
                    ) : (
                      <Tooltip title="Reenviar e-mail de confirmação">
                        <Button
                          inline
                          ghost
                          square
                          color="info"
                          size="small"
                          onClick={() => handleResendMail(participant.id)}
                        >
                          <FiMail size={20} />
                          <span style={{ fontSize: 13 }}>Reenviar</span>
                        </Button>
                      </Tooltip>
                    )
                  ) : (
                    '—'
                  )}
                </td>
                {show && (
                  <td>
                    <TableRow>
                      <Button
                        inline
                        ghost
                        square
                        color="secondary"
                        size="small"
                        onClick={() => {
                          setParticipant(participant)
                          setTypeModal('update')
                          setOpenParticipantModal(true)
                        }}
                      >
                        <FiEdit size={20} />
                      </Button>
                      <Button
                        inline
                        ghost
                        square
                        color="danger"
                        size="small"
                        onClick={() => {
                          setParticipant(participant)
                          setOpenDeleteModal(true)
                        }}
                      >
                        <FiTrash2 size={20} />
                      </Button>
                    </TableRow>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </PaginatedTable>
      </Card>
      <ParticipantModal
        openModal={openParticipantModal}
        onClose={handleCloseParticipantModal}
        type={typeModal}
        participant={participant}
        request={request}
      />
      <DeleteModal
        name="Participante"
        openModal={openDeleteModal}
        onClose={handleCloseDeleteModal}
        handleSubmit={handleSubmitDelete}
      >
        <>
          <Alert marginBottom="sm">
            Tem certeza que você deseja excluir o participante{' '}
            <b>{participant?.name}</b>?
          </Alert>
        </>
      </DeleteModal>
    </Container>
  )
}

export default withAuth(Participants)
