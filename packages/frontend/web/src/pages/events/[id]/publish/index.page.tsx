import {
  Alert,
  Button,
  Card,
  Container,
  Header,
  Stepper
} from '@components'
import { withAuth } from '@hocs'
import { useToast } from '@providers'
import { api } from '@services'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import {
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiSend
} from 'react-icons/fi'
import { EventInfo } from '../components'
import { EventActivity, EventCertificate, PublishSuccess } from './components'
import { CardHeader } from './styles'

const STEPS = [
  { id: 0, name: 'Informações' },
  { id: 1, name: 'Modelos de Certificados' },
  { id: 2, name: 'Atividades' },
  { id: 3, name: 'Pronto' }
]

const Publish: React.FC = () => {
  const router = useRouter()
  const { id } = router?.query
  const [event, setEvent] = useState(null)
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await api.get(`events/${id}`)
        const event = response?.data?.data

        if (event) {
          setEvent(event)
        }
      } catch (err) {
        addToast({
          title: 'Erro no carregamento',
          type: 'error',
          description: err
        })
        router.back()
      }
    }
    if (id) loadData()
  }, [id, addToast, router])

  const publish = useCallback(async () => {
    setLoading(true)
    try {
      await api.post(`events/${id}/publish`, {})
      setLoading(false)
      return true
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Erro ao publicar evento',
        description: err
      })
      setLoading(false)
      return false
    }
  }, [addToast, id])

  const handlePrevious = () => {
    if (currentStep === 0) {
      router.push(`/events/${event?.id}/info`)
    } else {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleNext = async () => {
    if (currentStep === STEPS.length - 1) {
      router.push(`/events/${event?.id}/info`)
    } else if (currentStep === 3) {
      const success = await publish()
      if (success) setCurrentStep(currentStep + 1)
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  return (
    <Container>
      <Head>
        <title>Publicar {event?.name} | Evento</title>
      </Head>
      <Header title={`Publicar ${event?.name}`} icon={FiSend} />
      <Stepper steps={STEPS} current={currentStep} />

      {currentStep !== STEPS.length - 1 && (
        <Alert marginBottom="md" card={true} type="warning">
          <b>Atenção!</b> Revise as informações antes de publicar o evento.
        </Alert>
      )}

      <Card>
        <CardHeader>
          <Button
            disabled={currentStep === STEPS.length - 1}
            ghost
            color="secondary"
            size="default"
            type="button"
            onClick={handlePrevious}
            inline
          >
            <FiChevronLeft size={20} />
            <span>Voltar</span>
          </Button>
          <Button
            color="primary"
            size="default"
            type="button"
            loading={loading}
            disabled={loading}
            onClick={handleNext}
            inline
          >
            {currentStep === STEPS.length - 1 && (
              <>
                <FiCheck size={20} />
                <span>Concluir</span>
              </>
            )}
            {currentStep === 3 && (
              <>
                <FiCheck size={20} />
                <span>Publicar</span>
              </>
            )}
            {currentStep !== 3 && currentStep !== STEPS.length - 1 && (
              <>
                <FiChevronRight size={20} />
                <span>Avançar</span>
              </>
            )}
          </Button>
        </CardHeader>

        {currentStep === 0 && (
          <EventInfo edit={false} event={event} setEvent={setEvent} />
        )}
        {currentStep === 1 && <EventCertificate event={event} />}
        {currentStep === 2 && (
          <EventActivity addToast={addToast} event={event} />
        )}
        {currentStep === 3 && <PublishSuccess />}
      </Card>
    </Container>
  )
}

export default withAuth(Publish)
