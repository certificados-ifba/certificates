/* eslint-disable no-throw-literal */
import { useCallback, useEffect, useState } from 'react'
import { FiMinusCircle, FiUserCheck } from 'react-icons/fi'

import ICertificate from '../../dtos/ICertificate'
import { useCertificates } from '../../providers/certificates'
import { useToast } from '../../providers/toast'
import api from '../../services/axios'
import {
  Container,
  SpaceBetween
} from '../../styles/components/certificateInfo'
import { theme } from '../../styles/theme'
import { capitalize } from '../../utils/capitalize'
import { Button } from '../button'
import { Spinner } from '../spinner'

interface Props {
  eventId: string
  certificate: ICertificate
}

const CertificateInfo: React.FC<Props> = ({ eventId, certificate }) => {
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()
  const { handleRemove, handleUpdate } = useCertificates()

  const handleRemoveCertificate = useCallback(async () => {
    try {
      console.log(certificate)

      if (!certificate.id) throw 'Erro não identificado'
      await api.delete(`tipos-certificado/${eventId}/certificates/${certificate.id}`)
      handleRemove(certificate)
      addToast({
        type: 'success',
        title: 'Participação Removida',
        description: 'O participante foi removido da atividade'
      })
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Erro na solicitação',
        description: err
      })
    }
  }, [addToast, handleRemove, certificate, eventId])

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const { data } = await api.post(`tipos-certificado/${eventId}/certificates`, {
          activity: certificate.activity,
          function: certificate.function,
          participant: certificate.participant.id,
          workload: certificate.workload,
          start_date: certificate.start_date,
          end_date: certificate.end_date,
          authorship_order: certificate.authorship_order,
          additional_field: certificate.additional_field
        })

        handleUpdate(certificate, { id: data?.data?.certificate?.id })
        setLoading(false)
      } catch (err) {
        handleRemove(certificate)
        addToast({
          type: 'error',
          title: 'Erro na solicitação',
          description: err
        })
      }
    }

    if (!certificate.id) load()
  }, [certificate, eventId, addToast, handleRemove, handleUpdate])

  return (
    <Container>
      {loading ? (
        <Spinner color={theme.colors.secondary} size={24} />
      ) : (
        <FiUserCheck color={theme.colors.primary} size={24} />
      )}
      <SpaceBetween>
        <h3>{capitalize(certificate?.participant?.name)}</h3>
        {!loading && (
          <Button
            inline
            ghost
            square
            color="danger"
            size="small"
            type="button"
            onClick={handleRemoveCertificate}
          >
            <FiMinusCircle size={20} />
          </Button>
        )}
      </SpaceBetween>
    </Container>
  )
}

export default CertificateInfo
