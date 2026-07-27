import { Table } from '@components'
import { api } from '@services'
import { useEffect, useState } from 'react'
import { FiAlertCircle, FiCheck } from 'react-icons/fi'

import { Participants } from '../eventActivity/styles'

interface Props {
  event: any
}

interface ICertificate {
  id: string
  activity: { name: string }
  function: { name: string }
  participant: { name: string }
  workload: number
  start_date: string
  end_date: string
}

export const EventCertificatesStep: React.FC<Props> = ({ event }) => {
  const [list, setList] = useState<ICertificate[]>([])
  const [loading, setLoading] = useState(false)
  const [limitWarning, setLimitWarning] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      if (!event?.id) return
      setLoading(true)
      try {
        const response = await api.get(`tipos-certificado/${event.id}/certificates`, {
          params: { take: 100, skip: 0 }
        })
        const data = response?.data?.data
        if (Array.isArray(data)) {
          setList(data)
          if (data.length >= 100) {
            setLimitWarning(true)
          }
        }
      } catch {
        // silently ignore
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [event])

  if (loading) {
    return <p style={{ padding: '16px' }}>Carregando certificados...</p>
  }

  if (list.length === 0) {
    return (
      <Participants color="danger" style={{ padding: '16px' }}>
        <FiAlertCircle size={20} />
        <span>Nenhum certificado encontrado</span>
      </Participants>
    )
  }

  return (
    <>
      {limitWarning && (
        <p style={{ color: '#c05621', padding: '8px 0' }}>
          Atenção: apenas os primeiros 100 certificados estão sendo exibidos. Podem existir mais registros.
        </p>
      )}
      <Table>
      <thead>
        <tr>
          <th>Participante</th>
          <th>Atividade</th>
          <th>Função</th>
          <th>Carga Horária</th>
          <th>Início</th>
          <th>Fim</th>
          <th style={{ width: 32 }} />
        </tr>
      </thead>
      <tbody>
        {list.map(cert => (
          <tr key={cert.id}>
            <td>{cert.participant?.name ?? '-'}</td>
            <td>{cert.activity?.name ?? '-'}</td>
            <td>{cert.function?.name ?? '-'}</td>
            <td>{cert.workload != null ? `${cert.workload} h` : '-'}</td>
            <td>
              {cert.start_date
                ? new Date(cert.start_date).toLocaleDateString()
                : '-'}
            </td>
            <td>
              {cert.end_date
                ? new Date(cert.end_date).toLocaleDateString()
                : '-'}
            </td>
            <td>
              <FiCheck size={20} color="green" />
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
    </>
  )
}
