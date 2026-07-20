import {
  Button,
  Card,
  Column,
  Container,
  Header,
  Input,
  PaginatedTable,
  TableRow,
  TipoCertificadoModal,
  TipoSelectorModal,
  Tag
} from '@components'
import { statusTipoCertificado } from '@dtos'
import { withAuth } from '@hocs'
import { useAuth } from '@providers'
import { usePaginatedRequest } from '@services'
import { Form } from '@unform/web'
import { formatDate } from '@utils'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useCallback, useState } from 'react'
import { FiCalendar, FiInfo, FiPlus, FiSearch } from 'react-icons/fi'

const Certificacoes: React.FC = () => {
  const [filters, setFilters] = useState(null)
  const [column, setColumn] = useState('name')
  const [order, setOrder] = useState<'' | 'ASC' | 'DESC'>('ASC')
  const [openTipoSelectorModal, setOpenTipoSelectorModal] = useState(false)
  const [openFormModal, setOpenFormModal] = useState(false)
  const [tipoSelecionado, setTipoSelecionado] = useState<string | null>(null)
  const { isAdmin } = useAuth()
  const router = useRouter()

  const request = usePaginatedRequest<any>({
    url: 'tipos-certificado',
    params:
      filters && order !== ''
        ? Object.assign(filters, { sort_by: column, order_by: order })
        : order !== ''
        ? { sort_by: column, order_by: order }
        : filters
  })

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

  const handleTipoSelecionado = useCallback((tipo: string) => {
    setTipoSelecionado(tipo)
    setOpenTipoSelectorModal(false)
    setOpenFormModal(true)
  }, [])

  const handleCloseFormModal = useCallback(() => {
    setOpenFormModal(false)
    setTipoSelecionado(null)
  }, [])

  return (
    <Container>
      <Head>
        <title>Certificações | Certificados</title>
      </Head>
      <Header
        title="Certificações"
        subtitle="Gerencie suas certificações (eventos, palestras, minicursos, etc), atividades, participantes e modelos de certificado."
        icon={FiCalendar}
        controls={
          isAdmin && (
            <nav>
              <Button onClick={() => setOpenTipoSelectorModal(true)}>
                <FiPlus size={20} />
                <span className="hide-md-down">Nova Certificação</span>
              </Button>
            </nav>
          )
        }
      />
      <Card>
        <header>
          <h2>Certificações cadastradas</h2>
          <Form onSubmit={handleFilter}>
            <Input name="search" placeholder="Buscar certificação" icon={FiSearch} />
          </Form>
        </header>
        <PaginatedTable request={request}>
          <thead>
            <tr>
              <th onClick={() => handleOrder('type')}>
                <Column order={order} selected={column === 'type'}>
                  Tipo
                </Column>
              </th>
              <th onClick={() => handleOrder('name')}>
                <Column order={order} selected={column === 'name'}>
                  Nome
                </Column>
              </th>
              <th onClick={() => handleOrder('edition')}>
                <Column order={order} selected={column === 'edition'}>
                  Edição
                </Column>
              </th>
              <th onClick={() => handleOrder('year')}>
                <Column order={order} selected={column === 'year'}>
                  Ano
                </Column>
              </th>
              <th onClick={() => handleOrder('local')}>
                <Column order={order} selected={column === 'local'}>
                  Local
                </Column>
              </th>
              <th onClick={() => handleOrder('start_date')}>
                <Column order={order} selected={column === 'start_date'}>
                  Data Inicial
                </Column>
              </th>
              <th onClick={() => handleOrder('end_date')}>
                <Column order={order} selected={column === 'end_date'}>
                  Data Final
                </Column>
              </th>
              <th onClick={() => handleOrder('user')}>
                <Column order={order} selected={column === 'user'}>
                  Coordenador
                </Column>
              </th>
              <th onClick={() => handleOrder('status')}>
                <Column order={order} selected={column === 'status'}>
                  Status
                </Column>
              </th>
              <th style={{ width: 32 }} />
            </tr>
          </thead>
          <tbody>
            {request.data?.data?.map(event => (
              <tr
                key={event?.id}
                onClick={() => {
                  router.push(`tipos-certificado/${event?.id}/info`)
                }}
              >
                <td>{event.type}</td>
                <td>{`${event.name} (${event.initials})`}</td>
                <td>{event.edition}</td>
                <td>{event.year}</td>
                <td>{event.local}</td>
                <td>{formatDate(event.start_date)}</td>
                <td>{formatDate(event.end_date)}</td>
                <td>{event?.user?.name}</td>
                <td>
                  <Tag size="lg" color={statusTipoCertificado[event.status]?.color}>
                    {statusTipoCertificado[event.status]?.text}
                  </Tag>
                </td>
                <td>
                  <TableRow>
                    <Button
                      inline
                      ghost
                      square
                      color="secondary"
                      size="small"
                      onClick={() => {
                        router.push(`tipos-certificado/${event?.id}/info`)
                      }}
                    >
                      <FiInfo size={20} />
                    </Button>
                  </TableRow>
                </td>
              </tr>
            ))}
          </tbody>
        </PaginatedTable>
      </Card>

      <TipoSelectorModal
        openModal={openTipoSelectorModal}
        onClose={() => setOpenTipoSelectorModal(false)}
        onSelect={handleTipoSelecionado}
      />
      <TipoCertificadoModal
        type="add"
        openModal={openFormModal}
        onClose={handleCloseFormModal}
        tipo={tipoSelecionado}
      />
    </Container>
  )
}

export default withAuth(Certificacoes)
