import {
  Alert,
  Button,
  Column,
  DeleteModal,
  Input,
  PaginatedTable,
  TableRow
} from '@components'
import { IActivity, ITipoCertificado } from '@dtos'
import { useToast } from '@providers'
import { api, usePaginatedRequest } from '@services'
import { FormHandles } from '@unform/core'
import { Form } from '@unform/web'
import { formatDate } from '@utils'
import { useRouter } from 'next/router'
import { useCallback, useRef, useState } from 'react'
import { FiEdit, FiFilePlus, FiPlus, FiSearch, FiTrash2 } from 'react-icons/fi'

import { ActivityModal } from '../../[tab]/components'

interface IRequest {
  data: IActivity[]
}

interface Props {
  event: ITipoCertificado
}

export const EventActivity: React.FC<Props> = ({ event }) => {
  const [activity, setActivity] = useState<IActivity>(null)
  const [openModal, setOpenModal] = useState(false)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [filters, setFilters] = useState(null)
  const [column, setColumn] = useState('name')
  const [order, setOrder] = useState<'' | 'ASC' | 'DESC'>('ASC')
  const [typeModal, setTypeModal] = useState<'update' | 'add'>(null)
  const searchFormRef = useRef<FormHandles>()
  const router = useRouter()

  const { addToast } = useToast()

  const request = usePaginatedRequest<IRequest>({
    url: `tipos-certificado/${event?.id}/activities`,
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

  const handleCloseModal = useCallback(() => {
    setOpenModal(false)
  }, [])

  const handleCloseDeleteModal = useCallback(() => {
    setOpenDeleteModal(false)
    setActivity(null)
  }, [])

  const handleSubmitDelete = useCallback(async () => {
    try {
      await api.delete(`tipos-certificado/${event?.id}/activities/${activity?.id}`)
      addToast({
        title: 'Atividade excluida',
        type: 'success',
        description: `${activity?.name} excluído com sucesso.`
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
  }, [event, activity, addToast, request])

  return (
    <>
      <header>
        <h2>Atividades do Evento</h2>
        <Form ref={searchFormRef} onSubmit={handleFilter}>
          <Input
            name="search"
            placeholder={`Buscar atividade no evento`}
            icon={FiSearch}
          />
        </Form>
        {event?.status !== 'PUBLISHED' && (
          <>
            <Button
              inline
              color="primary"
              size="small"
              onClick={() => {
                setActivity(null)
                setTypeModal('add')
                setOpenModal(true)
              }}
            >
              <FiPlus size={20} />
              <span>Adicionar Atividade</span>
            </Button>
            <Button
              inline
              color="info"
              size="small"
              onClick={() => {
                router.push(`/tipos-certificado/${event?.id}/activities/import`)
              }}
            >
              <FiFilePlus size={20} />
              <span>Importar via Planilha</span>
            </Button>
          </>
        )}
      </header>
      <PaginatedTable request={request}>
        <thead>
          <tr>
            <th onClick={() => handleOrder('name')}>
              <Column order={order} selected={column === 'name'}>
                Nome
              </Column>
            </th>
            <th>Tipo</th>
            <th>Carga Horária</th>
            <th>Início</th>
            <th>Fim</th>
            {event?.status !== 'PUBLISHED' && <th style={{ width: 32 }} />}
          </tr>
        </thead>
        <tbody>
          {request.data?.data?.map(activity => (
            <tr key={activity.id}>
              <td>{activity.name}</td>
              <td>{activity.type?.name}</td>
              <td>
                {activity.workload} Hora{Number(activity.workload) > 1 && 's'}
              </td>
              <td>{formatDate(activity.start_date)}</td>
              <td>{formatDate(activity.end_date)}</td>
              {event?.status !== 'PUBLISHED' && (
                <td>
                  <TableRow>
                    <Button
                      inline
                      ghost
                      square
                      color="secondary"
                      size="small"
                      onClick={() => {
                        setActivity(activity)
                        setTypeModal('update')
                        setOpenModal(true)
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
                        setActivity(activity)
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
      <ActivityModal
        type={typeModal}
        activity={activity}
        event={event}
        openModal={openModal}
        request={request}
        onClose={handleCloseModal}
      />
      <DeleteModal
        handleSubmit={handleSubmitDelete}
        name="Atividade"
        openModal={openDeleteModal}
        onClose={handleCloseDeleteModal}
      >
        <Alert>
          Tem certeza que você deseja excluir a atividade{' '}
          <b>{activity?.name}</b>?
        </Alert>
      </DeleteModal>
    </>
  )
}
