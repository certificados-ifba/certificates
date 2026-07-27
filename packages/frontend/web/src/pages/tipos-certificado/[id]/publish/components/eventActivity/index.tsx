import { Table } from '@components'
import { ToastMessage } from '@providers'
import { api } from '@services'
import { useEffect, useState } from 'react'
import { FiAlertCircle, FiCheck } from 'react-icons/fi'

import { Participants } from './styles'

interface Props {
  addToast: (message: Omit<ToastMessage, 'id'>) => void
  event: any
}

export const EventActivity: React.FC<Props> = ({ addToast, event }) => {
  const [list, setList] = useState([])
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await api.get(`tipos-certificado/${event.id}/activities`)
        if (response?.data?.data) setList(response.data.data)
      } catch (err) {
        addToast({
          title: 'Erro no carregamento',
          type: 'error',
          description: err
        })
      }
    }
    if (event) loadData()
  }, [addToast, event])
  return (
    <>
      <div>
        <Table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Carga Horária</th>
              <th>Início</th>
              <th>Fim</th>
              <th style={{ width: 32 }} />
            </tr>
          </thead>
          <tbody>
            {list.map(act => (
              <tr key={act.id}>
                <td>{act.name}</td>
                <td>{act.activitieType}</td>
                <td>{act.workload} h</td>
                <td>{new Date(act.start_date).toLocaleDateString()}</td>
                <td>{new Date(act.end_date).toLocaleDateString()}</td>
                <td>
                  {act.participants === 0 && (
                    <Participants color="danger">
                      <FiAlertCircle size={25} />
                      <span>Nenhum participante</span>
                    </Participants>
                  )}
                  {act.participants > 0 && (
                    <Participants color="success">
                      <FiCheck size={25} />
                      <span>
                        {act.participants} participante
                        {act.participants > 1 && 's'}
                      </span>
                    </Participants>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </>
  )
}
