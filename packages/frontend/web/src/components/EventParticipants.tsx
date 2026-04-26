import { useEffect, useState } from 'react'
import { Table, Card, Spinner, Alert } from '@components'
import { api } from '@services'

interface Participant {
  id: string
  name: string
  email: string
  cpf: string
}

interface Props {
  eventId: string
}

export const EventParticipants: React.FC<Props> = ({ eventId }) => {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    api
      .get(`/events/${eventId}/participants`)
      .then(res => {
        setParticipants(res.data?.data || [])
        setError(null)
      })
      .catch(err => {
        setError('Erro ao carregar participantes')
      })
      .finally(() => setLoading(false))
  }, [eventId])

  if (loading) return <Spinner size={40} />
  if (error) return <Alert type="danger">{error}</Alert>

  return (
    <Card>
      <h2>Participantes do Evento</h2>
      <Table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>CPF</th>
            <th>E-mail</th>
          </tr>
        </thead>
        <tbody>
          {participants.map(p => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.cpf}</td>
              <td>{p.email}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  )
}
