import { Accordion } from '@components'
import { ITipoCertificado } from '@dtos'
import { CertificatesProvider } from '@providers'
import { useCallback, useState } from 'react'
import { FiPlusCircle, FiUsers } from 'react-icons/fi'

import { CertificateList, CertificateForm } from '..'

import { Container } from './styles'

interface Props {
  event: ITipoCertificado
}

export const EventParticipant: React.FC<Props> = ({ event }) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleOpenAccordion = useCallback(() => setIsOpen(true), [])
  const handleCloseAccordion = useCallback(() => setIsOpen(false), [])
  const handleToggle = useCallback(() => setIsOpen(isOpen => !isOpen), [])

  return (
    <Container>
      {event?.status !== 'PUBLISHED' && (
        <Accordion
          title="Adicionar Participações"
          onToggle={handleToggle}
          isOpen={isOpen}
          icon={FiPlusCircle}
        >
          <CertificatesProvider>
            <CertificateForm
              event={event}
              closeAccordion={handleCloseAccordion}
            />
          </CertificatesProvider>
        </Accordion>
      )}
      <Accordion title="Participantes do Evento" isOpen={true} icon={FiUsers}>
        <CertificateList event={event} openAccordion={handleOpenAccordion} />
      </Accordion>
    </Container>
  )
}
