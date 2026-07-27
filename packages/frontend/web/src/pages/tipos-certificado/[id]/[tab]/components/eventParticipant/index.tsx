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
  const [revalidateKey, setRevalidateKey] = useState(0)
  const handleOpenAccordion = useCallback(() => setIsOpen(true), [])
  const handleCloseAccordion = useCallback(() => setIsOpen(false), [])
  const handleToggle = useCallback(() => setIsOpen(isOpen => !isOpen), [])
  const handleRevalidateList = useCallback(() => {
    setRevalidateKey(prev => prev + 1)
  }, [])

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
              onParticipantSaved={handleRevalidateList}
            />
          </CertificatesProvider>
        </Accordion>
      )}
      <Accordion title="Participantes do Evento" icon={FiUsers}>
        <CertificateList
          key={revalidateKey}
          event={event}
          openAccordion={handleOpenAccordion}
        />
      </Accordion>
    </Container>
  )
}
