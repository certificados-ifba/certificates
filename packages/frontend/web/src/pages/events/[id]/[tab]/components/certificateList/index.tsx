import {
  Alert,
  Button,
  Column,
  DeleteModal,
  Input,
  PaginatedTable,
  TableRow
} from '@components'
import { IActivity, IEvent, IGeneric, IParticipant } from '@dtos'
import { useToast } from '@providers'
import { api, usePaginatedRequest } from '@services'
import { FormHandles } from '@unform/core'
import { Form } from '@unform/web'
import { capitalize } from '@utils'
import { useRouter } from 'next/router'
import { useCallback, useRef, useState } from 'react'
import {
  FiDownload,
  FiExternalLink,
  FiFilePlus,
  FiMinusCircle,
  FiPlus,
  FiSearch
} from 'react-icons/fi'

interface Props {
  event: IEvent
  openAccordion: () => void
}

const maskCpf = (cpf: string): string => {
  if (!cpf) return ''
  const clean = cpf.replace(/\D/g, '')
  if (clean.length !== 11) return cpf
  return `***.${clean.slice(3, 6)}.${clean.slice(6, 9)}-**`
}
interface ICertificate {
  id: string
  activity: IActivity
  function: IGeneric
  participant: IParticipant
  event: Event
  key: string
  workload: number
  start_date: Date
  end_date: Date
  authorship_order: string
  additional_field: string
  created_at: Date
  updated_at: Date
}

interface IRequest {
  data: ICertificate[]
}

export const CertificateList: React.FC<Props> = ({ event, openAccordion }) => {
  const router = useRouter()
  const [filters, setFilters] = useState(null)
  const [column, setColumn] = useState('created_at')
  const [order, setOrder] = useState<'' | 'ASC' | 'DESC'>('DESC')
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [id, setId] = useState('')
  const searchFormRef = useRef<FormHandles>()

  const { addToast } = useToast()

  const request = usePaginatedRequest<IRequest>({
    url: `events/${event?.id}/certificates`,
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

  const handleCloseDeleteModal = useCallback(() => {
    setOpenDeleteModal(false)
    setId('')
  }, [])

  const handleSubmitDelete = useCallback(async () => {
    try {
      await api.delete(`events/${event?.id}/certificates/${id}`)
      addToast({
        title: 'Certificado excluida',
        type: 'success',
        description: 'Certificado excluído com sucesso.'
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
  }, [event, addToast, request, id])

  return (
    <>
      <header>
        <h2>Participantes</h2>
        <Form ref={searchFormRef} onSubmit={handleFilter}>
          <Input
            name="search"
            placeholder={`Buscar participante no evento`}
            icon={FiSearch}
          />
        </Form>
        <Button size="small" inline onClick={openAccordion}>
          <FiPlus size={20} />
          <span>Adicionar Atividade</span>
        </Button>
        <Button
          inline
          color="info"
          size="small"
          onClick={() => {
            router.push(`/import/events/certificates/${event?.id}`)
          }}
        >
          <FiFilePlus size={20} />
          <span>Importar via Planilha</span>
        </Button>
      </header>
      <PaginatedTable request={request}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>CPF</th>
            <th>Atividade</th>
            <th>Função</th>
            <th>Carga Horária</th>
            <th>Data Início</th>
            <th>Data Fim</th>
            <th onClick={() => handleOrder('created_at')}>
              <Column order={order} selected={column === 'created_at'}>
                Incluído Em
              </Column>
            </th>
            <th style={{ width: 32 }} />
          </tr>
        </thead>
        <tbody>
          {request.data?.data?.map(
            ({
              id,
              activity: { name: activity },
              participant: {
                name,
                personal_data: { cpf }
              },
              function: { name: _function },
              workload,
              start_date,
              end_date,
              created_at
            }) => (
              <tr key={id}>
                <td>{name}</td>
                <td>{maskCpf(cpf)}</td>
                <td>{activity}</td>
                <td>{capitalize(_function)}</td>
                <td>
                  {workload} Hora{Number(workload) > 1 && 's'}
                </td>
                <td>{new Date(start_date).toLocaleDateString()}</td>
                <td>{new Date(end_date).toLocaleDateString()}</td>
                <td>{new Date(created_at).toLocaleString()}</td>
                <td>
                  <TableRow>
                    <Button
                      inline
                      ghost
                      square
                      color="success"
                      size="small"
                      onClick={() => {
                        //   setCertificateSelected(act.id)
                        //   setNameActivitySelected(act.name)
                        //   setOpenDeleteModal(true)
                      }}
                    >
                      <FiExternalLink size={20} />
                    </Button>
                    <Button
                      inline
                      ghost
                      square
                      color="info"
                      size="small"
                      onClick={() => {
                        //   setCertificateSelected(act.id)
                        //   setNameActivitySelected(act.name)
                        //   setOpenDeleteModal(true)
                      }}
                    >
                      <FiDownload size={20} />
                    </Button>
                    <Button
                      inline
                      ghost
                      square
                      color="danger"
                      size="small"
                      onClick={() => {
                        setId(id)
                        setOpenDeleteModal(true)
                      }}
                    >
                      <FiMinusCircle size={20} />
                    </Button>
                  </TableRow>
                </td>
              </tr>
            )
          )}
        </tbody>
      </PaginatedTable>
      <DeleteModal
        handleSubmit={handleSubmitDelete}
        name="Participação"
        openModal={openDeleteModal}
        onClose={handleCloseDeleteModal}
      >
        <Alert>Tem certeza que você deseja excluir?</Alert>
      </DeleteModal>
    </>
  )
}
