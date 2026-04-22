import {
  Alert,
  Button,
  Card,
  Container,
  // getSelected,
  // getStepList,
  Header
  // StepConfig,
  // Stepper
} from '@components'
import { withAuth } from '@hocs'
import { useToast } from '@providers'
import { api } from '@services'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { FiCheck, FiChevronLeft, FiChevronRight, FiSend } from 'react-icons/fi'

import { EventInfo } from '../components'
import { EventActivity, EventCertificate, PublishSuccess } from './components'
import { CardHeader } from './styles'

// import Alert from '../../../components/alert'
// import Button from '../../../components/button'
// import Card from '../../../components/card'
// import Header from '../../../components/header'
// import Stepper, {
//   getSelected,
//   getStepList,
//   StepConfig
// } from '../../../components/stepper'
// import EventActivity from '../../../components/steps/eventActivity'
// import EventCertificate from '../../../components/steps/eventCertificate'
// import PublishSuccess from '../../../components/steps/publishSuccess'
// import EventInfo from '../../../components/tabs/eventInfo'
// import withAuth from '../../../hocs/withAuth'
// import { useToast } from '../../../providers/toast'
// import api from '../../../services/axios'
// import { Container } from '../../../styles/pages/home'
// import { CardHeader } from '../../../styles/pages/publish'

const infoName = 'Informações'
const activityName = 'Atividades'
const modelName = 'Modelos de Certificados'
const endName = 'Pronto'

// const stepConfig: StepConfig[] = [
//   { name: infoName },
//   { name: activityName },
//   { name: modelName },
//   { name: endName }
// ]

const Publish: React.FC = () => {
  const router = useRouter()
  const { id } = router?.query
  const [event, setEvent] = useState(null)
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)

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
        history.back()
      }
    }
    if (id) loadData()
  }, [id, addToast])

  const stepNames = [infoName, activityName, modelName, endName]
  const [step, setStep] = useState(0)
  const currentStep = stepNames[step]

  const publish = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.post(`events/${id}/publish`, {})
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

  return (
    <Container>
      <Head>
        <title>Publicar {event?.name} | Evento</title>
      </Head>
      <Header title={`Publicar ${event?.name}`} icon={FiSend} />
      {currentStep !== endName && (
        <Alert marginBottom="md" card={true} type="warning">
          <b>Atenção!</b> Revise as informações antes de publicar o evento.
        </Alert>
      )}
      <Card>
        <CardHeader>
          <Button
            disabled={currentStep === endName}
            ghost
            color="secondary"
            size="default"
            type="button"
            onClick={() => {
              if (currentStep === infoName) {
                router.push(`/events/${event.id}/info`)
              } else {
                setStep(s => s - 1)
              }
            }}
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
            onClick={() => {
              if (currentStep === endName) {
                router.push(`/events/${event.id}/info`)
              } else if (currentStep === modelName) {
                publish().then(success => {
                  if (success) setStep(s => s + 1)
                })
              } else {
                setStep(s => s + 1)
              }
            }}
            inline
          >
            {currentStep === endName && (
              <>
                <FiCheck size={20} />
                <span>Concluir</span>
              </>
            )}
            {currentStep === modelName && (
              <>
                <FiCheck size={20} />
                <span>Publicar</span>
              </>
            )}
            {currentStep !== modelName && currentStep !== endName && (
              <>
                <FiChevronRight size={20} />
                <span>Avançar</span>
              </>
            )}
          </Button>
        </CardHeader>
        {currentStep === infoName && (
          <EventInfo edit={false} event={event} setEvent={setEvent} />
        )}
        {currentStep === activityName && (
          <EventActivity addToast={addToast} event={event} />
        )}
        {currentStep === modelName && <EventCertificate event={event} />}
        {currentStep === endName && <PublishSuccess />}
      </Card>
    </Container>
  )
}

export default withAuth(Publish)
