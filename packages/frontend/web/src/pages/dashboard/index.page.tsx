import {
  Alert,
  AsyncSelect,
  Button,
  Card,
  CardIcon,
  Column,
  Container,
  Dropdown,
  Grid,
  Header,
  Input,
  PaginatedTable,
  TableRow,
  Tag
} from '@components'
import { ITipoCertificado, IUser, statusTipoCertificado } from '@dtos'
import { withAuth } from '@hocs'
import { useAuth } from '@providers'
import { api, usePaginatedRequest } from '@services'
import { FormHandles } from '@unform/core'
import { Form } from '@unform/web'
import { formatDate } from '@utils'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  FiAward,
  FiDownload,
  FiEdit,
  FiFileText,
  FiHome,
  FiInfo,
  FiPlusCircle,
  FiSearch,
  FiSend,
  FiTool,
  FiUsers
} from 'react-icons/fi'

const Home: React.FC = () => {
  const [user, setUser] = useState<IUser>()
  const [events, setEvents] = useState<ITipoCertificado[]>([])
  const [dropActive, setDropActive] = useState(false)
  const { user: userAuth } = useAuth()
  const [filters, setFilters] = useState({ per_page: 5 })
  const [column] = useState('end_date')
  const [order] = useState<'' | 'ASC' | 'DESC'>('DESC')
  const router = useRouter()

  const [event, setEvent] = useState({
    participants: 15,
    certificates: 30,
    download: 15,
    activities: 5,
    id: '613c0def12ccb500323a0940',
    name: 'Evento 1'
  })

  useEffect(() => {
    if (!user) {
      setUser(userAuth)
    }
  }, [user, userAuth])

  const firstName = user?.name.split(' ')[0]

  const formRef = useRef<FormHandles>(null)
  formRef.current?.setData({ event: '1' })

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

  const loadEvents = useCallback(async search => {
    const response = await api.get<{ data: ITipoCertificado[] }>('tipos-certificado', {
      params: { search, sort_by: 'end_date', order_by: 'DESC' }
    })

    const data = []

    response.data?.data?.forEach(({ id, name }) => {
      data.push({
        value: id,
        label: name
      })
    })
    return data
  }, [])

  useEffect(() => {
    const events = request.data?.data
    if (events) {
      setEvents(events)
      formRef.current?.setData({
        event: {
          label: events[0]?.name,
          value: events[0]?.id
        }
      })
    }
  }, [request])

  return (
    <Container>
      <Head>
        <title>Página quase Inicial | Certificados</title>
      </Head>
      <Header
        title="Página quase Inicial"
        subtitle={
          <>
            Seja bem vindo, <b>{firstName}</b>
          </>
        }
        icon={FiHome}
        controls={
          <Form
            style={{ display: 'flex' }}
            ref={formRef}
            onSubmit={() => {
              console.log()
            }}
          >
            <div>
              <Dropdown
                icon={FiTool}
                setActive={setDropActive}
                active={dropActive}
                ghost
                size="small"
                color="secondary"
                dropdownChildren={
                  <>
                    <Button
                      style={{ marginBottom: '10px' }}
                      ghost
                      color="secondary"
                      size="small"
                      type="button"
                      onClick={() => {
                        router.push(`/tipos-certificado/${event?.id}/info`)
                      }}
                    >
                      <FiEdit size={20} />
                      <span>Editar Evento</span>
                    </Button>
                    <Button
                      style={{ marginBottom: '10px' }}
                      ghost
                      color="info"
                      size="small"
                      type="button"
                      onClick={() => {
                        router.push(`/tipos-certificado/${event?.id}/models`)
                      }}
                    >
                      <FiFileText size={20} />
                      <span>Configurar Modelos</span>
                    </Button>
                    <Button
                      color="primary"
                      size="small"
                      type="button"
                      onClick={() => {
                        router.push(`/tipos-certificado/${event?.id}/publish`)
                      }}
                    >
                      <FiSend size={20} />
                      <span>Publicar Evento</span>
                    </Button>
                  </>
                }
              >
                Opções
              </Dropdown>
            </div>
            <div style={{ width: '300px' }}>
              <AsyncSelect name="event" loadOptions={loadEvents} />
              {/* <NewSelect
                name="event"
                defaultValue={{
                  label: events[0]?.name,
                  value: events[0]?.id
                }}
                options={events?.map(({ id, name }) => ({
                  label: name,
                  value: id
                }))}
              /> */}
            </div>
          </Form>
        }
      />
      <Alert type="warning" card>
        <h2>Atenção!</h2>
        Esse evento ainda não foi publicado!
      </Alert>
      <div style={{ margin: '20px 0' }}>
        <Grid firstWidth="1330px" cols={4}>
          <div>
            <CardIcon
              title="Participantes"
              value={event?.participants + ''}
              icon={<FiUsers size={24} />}
              color="secondary"
              buttonName="Detalhar"
              buttonIcon={<FiInfo size={20} />}
              onButtonClick={() => {
                router.push(`/dashboard/${event?.id}/participants`)
              }}
            />
          </div>
          <div>
            <CardIcon
              title="Certificados"
              value={event?.certificates + ''}
              icon={<FiAward size={24} />}
              color="info"
              buttonName="Adicionar"
              buttonIcon={<FiPlusCircle size={20} />}
              onButtonClick={() => {
                router.push(`/tipos-certificado/${event?.id}/certificates`)
              }}
            />
          </div>
          <div>
            <CardIcon
              title="Baixaram"
              value={event?.download + '%'}
              icon={<FiDownload size={24} />}
              color="primary"
              buttonName="Ver Downloads"
              buttonIcon={<FiInfo size={20} />}
              onButtonClick={() => {
                router.push(`/dashboard/${event?.id}/certificates/`)
              }}
            />
          </div>
          <div>
            <CardIcon
              title="Atividades"
              value={event?.activities + ''}
              icon={<FiFileText size={24} />}
              color="warning"
              buttonName="Adicionar"
              buttonIcon={<FiPlusCircle size={20} />}
              onButtonClick={() => {
                router.push(`/tipos-certificado/${event?.id}/activities`)
              }}
            />
          </div>
        </Grid>
      </div>
      <Card>
        <header>
          <h2>Últimos Eventos</h2>
          <Form onSubmit={handleFilter}>
            <Input name="search" placeholder="Buscar evento" icon={FiSearch} />
          </Form>
        </header>
        <PaginatedTable request={request}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Status</th>
              <th>Data Inicial</th>
              <th>
                <Column order={order} selected={column === 'end_date'}>
                  Data Final
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
                  router.push(`/tipos-certificado/${event?.id}/info`)
                }}
              >
                <td>{`${event.name} (${event.initials})`}</td>
                <td>
                  <Tag size="lg" color={statusTipoCertificado[event.status]?.color}>
                    {statusTipoCertificado[event.status]?.text}
                  </Tag>
                </td>
                <td>{formatDate(event.start_date)}</td>
                <td>{formatDate(event.end_date)}</td>
                <td>
                  <TableRow>
                    <Button
                      inline
                      ghost
                      square
                      color="secondary"
                      size="small"
                      onClick={() => {
                        router.push(`/tipos-certificado/${event?.id}/info`)
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
    </Container>
  )
}

export default withAuth(Home)
