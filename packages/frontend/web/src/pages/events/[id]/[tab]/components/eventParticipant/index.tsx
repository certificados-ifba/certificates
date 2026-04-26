import { Accordion, Button } from '@components'
import { IEvent } from '@dtos'
import { CertificatesProvider } from '@providers'
import { useRouter } from 'next/router'
import { useCallback, useState } from 'react'
import { FiFilePlus, FiPlusCircle, FiUsers } from 'react-icons/fi'

import { CertificateList, CertificateForm } from '..'

import { Container } from './styles'

interface Props {
  event: IEvent
}

export const EventParticipant: React.FC<Props> = ({ event }) => {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const handleOpenAccordion = useCallback(() => setIsOpen(true), [])
  const handleCloseAccordion = useCallback(() => setIsOpen(false), [])
  const handleToggle = useCallback(() => setIsOpen(isOpen => !isOpen), [])

  return (
    <Container>
      <header>
        <h2>Participantes do Evento</h2>
      </header>
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
      <Accordion title="Participantes do Evento" icon={FiUsers}>
        <CertificateList event={event} openAccordion={handleOpenAccordion} />
      </Accordion>
    </Container>
  )
}
