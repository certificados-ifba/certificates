import {
  Button,
  Card,
  Column,
  Input,
  Loading,
  PaginatedTable,
  TableRow
} from '@components'
import { usePaginatedRequest } from '@services'
import { Form } from '@unform/web'
import { formatDate } from '@utils'
import { useCallback, useState } from 'react'
import { FiCalendar, FiSearch } from 'react-icons/fi'

interface Props {
  token: string
  loading: boolean
}

export const Events: React.FC<Props> = ({ token, loading }) => {
  const [filtersEvent, setFiltersEvent] = useState(null)
  const [columnEvent, setColumnEvent] = useState('name')
  const [orderEvent, setOrderEvent] = useState<'' | 'ASC' | 'DESC'>('ASC')

  const requestEvent = usePaginatedRequest<any>({
    url: 'tipos-certificado',
    headers: { authorization: `Bearer ${token}` },
    params:
      filtersEvent && orderEvent !== ''
        ? Object.assign(filtersEvent, {
            sort_by: columnEvent,
            order_by: orderEvent
          })
        : orderEvent !== ''
        ? { sort_by: columnEvent, order_by: orderEvent }
        : filtersEvent
  })

  const handleFilterEvent = useCallback(
    data => {
      !data.search && delete data.search
      requestEvent.resetPage()
      setFiltersEvent(data)
    },
    [requestEvent]
  )

  const handleOrderEvent = useCallback(
    columnSelected => {
      if (columnEvent !== columnSelected) {
        setColumnEvent(columnSelected)
        setOrderEvent('ASC')
      } else {
        setOrderEvent(value =>
          value === '' ? 'ASC' : value === 'ASC' ? 'DESC' : ''
        )
      }
    },
    [columnEvent]
  )

  return (
    <div style={{ marginTop: '15px' }}>
      <Card>
        <header>
          <h2>
            <FiCalendar size={30} /> <span>Eventos que você participou</span>
          </h2>
          {!loading && (
            <Form onSubmit={handleFilterEvent}>
              <Input
                name="search"
                placeholder="Buscar evento"
                icon={FiSearch}
              />
            </Form>
          )}
        </header>
        <Loading active={loading} />
        {!loading && (
          <PaginatedTable request={requestEvent}>
            <thead>
              <tr>
                <th onClick={() => handleOrderEvent('name')}>
                  <Column order={orderEvent} selected={columnEvent === 'name'}>
                    Nome
                  </Column>
                </th>
                <th onClick={() => handleOrderEvent('period')}>
                  <Column
                    order={orderEvent}
                    selected={columnEvent === 'period'}
                  >
                    Período
                  </Column>
                </th>
                <th onClick={() => handleOrderEvent('local')}>
                  <Column order={orderEvent} selected={columnEvent === 'local'}>
                    Local
                  </Column>
                </th>
                <th onClick={() => handleOrderEvent('edition')}>
                  <Column
                    order={orderEvent}
                    selected={columnEvent === 'edition'}
                  >
                    Edição
                  </Column>
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {requestEvent.data?.data?.map(event => (
                <tr key={event.id}>
                  <td>
                    {event?.name} ({event?.initials})
                  </td>
                  <td>
                    De {formatDate(event?.start_date)} até{' '}
                    {formatDate(event?.end_date)}
                  </td>
                  <td>{event?.local}</td>
                  <td>{event?.edition}</td>
                  <td>
                    <TableRow>
                      <Button
                        ghost
                        inline
                        square
                        color="secondary"
                        size="small"
                        onClick={() => {
                          console.log()
                        }}
                      >
                        <FiSearch size={20} />
                        <span>Ver Atividades</span>
                      </Button>
                    </TableRow>
                  </td>
                </tr>
              ))}
            </tbody>
          </PaginatedTable>
        )}
      </Card>
    </div>
  )
}
