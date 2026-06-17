/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable react/display-name */
import { FormHandles } from '@unform/core'
import { Form } from '@unform/web'
import { useCallback, useRef, useState } from 'react'
import {
  FiAlertCircle,
  FiAlignCenter,
  FiBook,
  FiBriefcase,
  FiCalendar,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiCreditCard,
  FiFileText,
  FiMail,
  FiUsers,
  FiX
} from 'react-icons/fi'
import { components } from 'react-select'
import * as Yup from 'yup'

import { IActivity } from '../../dtos/IActivity'
import { ITipoCertificado } from '../../dtos/ITipoCertificado'
import { IGeneric } from '../../dtos/IGeneric'
import { IParticipant } from '../../dtos/IParticipant'
import { useCertificates } from '../../providers/certificates'
import { useToast } from '../../providers/toast'
import api from '../../services/axios'
import { Footer, Section } from '../../styles/components/accordion'
import {
  InfoOption,
  TitleOption
} from '../../styles/components/accordions/participationForm'
import { Divider } from '../../styles/components/divider'
import { Row } from '../../styles/components/grid'
import { Badge, Group, IconArea } from '../../styles/components/select'
import { capitalize } from '../../utils/capitalize'
import { getValidationErrors } from '../../utils/getValidationErrors'
import { AccordionCard } from '../accordionCard'
import { Alert } from '../alert'
import { AsyncSelect } from '../asyncSelect'
import { Button } from '../button'
import { Input } from '../input'
import CertificateInfo from './certificateInfo'

interface Props {
  event: ITipoCertificado
  closeAccordion: () => void
}

const CertificateForm: React.FC<Props> = ({ event, closeAccordion }) => {
  const [showAll, setShowAll] = useState(false)
  const { addToast } = useToast()
  const { certificates, isEmpty, handleAdd, handleReset } = useCertificates()
  const formRef = useRef<FormHandles>(null)

  const focusSelect = useCallback((field: string) => {
    const select = formRef?.current?.getFieldRef(field)?.select
    if (!select) return
    select.state.menuIsOpen = true
    select.select?.focus()
  }, [])

  const clearSelect = useCallback((field: string) => {
    const select = formRef?.current?.getFieldRef(field)?.select
    select?.select?.setValue(null)
  }, [])

  const handleParticipantSelect = useCallback(
    async (participant: any) => {
      if (!participant) return
      const data = formRef.current?.getData()
      const schema = Yup.object().shape({
        activity: Yup.string().required('Selecione a atividade'),
        function: Yup.string().required('Selecione a função'),
        workload: Yup.string().required('Por favor, digite a carga horária'),
        start_date: Yup.string().required(
          'Selecione a data inicial da atividade'
        ),
        end_date: Yup.string().required('Selecione a data final da atividade')
      })
      try {
        await schema.validate(data, {
          abortEarly: false
        })
        const {
          activity,
          function: _function,
          workload,
          start_date,
          end_date,
          authorship_order,
          additional_field
        } = data
        handleAdd({
          activity,
          function: _function,
          workload,
          start_date,
          end_date,
          authorship_order,
          additional_field,
          participant
        })
        clearSelect('participant')
        focusSelect('participant')
      } catch (err) {
        clearSelect('participant')
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err)
          formRef.current?.setErrors(errors)
          return
        }
        addToast({
          type: 'error',
          title: 'Erro ao adicionar a participação',
          description: err
        })
      }
    },
    [addToast, handleAdd, clearSelect, focusSelect]
  )

  const handleSelectActivity = useCallback(data => {
    if (data?.activity) {
      formRef.current.setFieldValue('workload', data.activity.workload)
      formRef.current.setFieldValue('start_date', data.activity.start_date)
      formRef.current.setFieldValue('end_date', data.activity.end_date)
    } else {
      formRef.current.setFieldValue('workload', null)
      formRef.current.setFieldValue('start_date', null)
      formRef.current.setFieldValue('end_date', null)
    }
  }, [])

  const loadFunctions = useCallback(async search => {
    const response = await api.get<{ data: IGeneric[] }>('/functions', {
      params: { search, sort_by: 'name', order_by: 'ASC' }
    })

    const data = []

    response.data?.data?.forEach(_function => {
      data.push({
        value: _function.id,
        label: capitalize(_function.name)
      })
    })
    return data
  }, [])

  const loadActivities = useCallback(
    async search => {
      const response = await api.get<{ data: IActivity[] }>(
        `tipos-certificado/${event?.id}/activities`,
        {
          params: { search, sort_by: 'name', order_by: 'ASC' }
        }
      )

      const data = []

      response.data?.data?.forEach(activity => {
        const index = data.findIndex(
          item => item.label === activity?.type?.name
        )
        if (index !== -1) {
          data[index].options.push({
            value: activity.id,
            label: activity.name,
            activity: {
              workload: activity.workload,
              start_date: activity.start_date,
              end_date: activity.end_date
            }
          })
        } else {
          data.push({
            label: activity?.type?.name,
            options: [
              {
                value: activity.id,
                label: activity.name,
                activity: {
                  workload: activity.workload,
                  start_date: activity.start_date,
                  end_date: activity.end_date
                }
              }
            ]
          })
        }
      })
      return data
    },
    [event?.id]
  )

  const formatGroupLabel = data => (
    <Group>
      <span>{data.label}</span>
      <Badge>{data.options.length}</Badge>
    </Group>
  )

  const loadParticipants = useCallback(async search => {
    const response = await api.get<{ data: IParticipant[] }>('/participants', {
      params: { search, sort_by: 'name', order_by: 'ASC' }
    })

    const data = []

    response.data?.data?.forEach(participant => {
      data.push(participant)
    })
    return data
  }, [])

  return (
    <Form ref={formRef} onSubmit={() => {}}>
      <header>
        <h2>Em qual atividade?</h2>
      </header>
      <Section paddingBottom="sm">
        <AsyncSelect
          marginBottom="sm"
          label="Atividade"
          formRef={formRef}
          name="activity"
          loadOptions={loadActivities}
          handleOnSelect={handleSelectActivity}
          formatGroupLabel={formatGroupLabel}
          icon={FiFileText}
        />
        <Row cols={3}>
          <AsyncSelect
            marginBottom="sm"
            label="Função"
            formRef={formRef}
            name="function"
            loadOptions={loadFunctions}
            icon={FiBriefcase}
          />
          <Input
            type="date"
            name="start_date"
            label="Inicia em"
            marginBottom="sm"
            placeholder="Data de Início"
            icon={FiCalendar}
          />
          <Input
            marginBottom="sm"
            type="date"
            name="end_date"
            label="Termina em"
            placeholder="Data Final"
            icon={FiCalendar}
          />
          <Input
            type="number"
            name="workload"
            label="Carga Horária"
            marginBottom="sm"
            placeholder="Carga Horária em Horas"
            icon={FiClock}
          />
          <Input
            marginBottom="sm"
            type="text"
            name="authorship_order"
            label="Ordem Autoria"
            placeholder="Ordem Autoria"
            icon={FiBook}
          />
          <Input
            marginBottom="sm"
            type="text"
            name="additional_field"
            label="Texto Adicional"
            placeholder="Texto Adicional"
            icon={FiAlignCenter}
          />
        </Row>
      </Section>
      <Divider />
      <header>
        <h2>Quem participou?</h2>
      </header>
      <Section paddingBottom="md">
        <Row cols={2}>
          <AsyncSelect
            marginBottom="md"
            formRef={formRef}
            name="participant"
            loadOptions={loadParticipants}
            handleOnSelect={handleParticipantSelect}
            components={{
              Control: ({ children, ...rest }: any) => (
                <components.Control {...rest}>
                  <>
                    <IconArea>
                      <FiUsers size={20} />
                    </IconArea>
                    {children}
                  </>
                </components.Control>
              ),
              Option: props => (
                <components.Option {...props}>
                  <TitleOption>{capitalize(props.data?.name)}</TitleOption>
                  <Row cols={2}>
                    <InfoOption>
                      <FiCreditCard size={18} />
                      {props.data?.personal_data?.cpf}
                    </InfoOption>
                    <InfoOption>
                      <FiMail size={18} />
                      {props.data?.email}
                    </InfoOption>
                    <InfoOption>
                      <FiCalendar size={18} />
                      {props.data?.personal_data?.dob}
                    </InfoOption>
                    <InfoOption>
                      <FiClock size={18} />
                      {new Date(props.data?.updated_at).toLocaleString()}
                    </InfoOption>
                  </Row>
                </components.Option>
              )
            }}
          />
        </Row>
        {isEmpty ? (
          <Alert icon={FiAlertCircle} size="md" type="info">
            Use o campo para adicionar participantes na atividade
          </Alert>
        ) : (
          <>
            <Row cols={4} marginBottom="md">
              {certificates?.map(
                (certificate, index) =>
                  (showAll || index < 4) && (
                    <div key={index}>
                      <AccordionCard
                        info={
                          <CertificateInfo
                            eventId={event.id}
                            certificate={certificate}
                          />
                        }
                      >
                        <main>
                          <Alert
                            marginBottom="xs"
                            size="sm"
                            icon={FiCreditCard}
                          >
                            {certificate?.participant?.personal_data?.cpf}
                          </Alert>
                          {certificate?.participant?.email && (
                            <Alert marginBottom="xs" size="sm" icon={FiMail}>
                              {certificate?.participant?.email}
                            </Alert>
                          )}
                          <Alert size="sm" marginBottom="xs" icon={FiCalendar}>
                            {certificate?.participant?.personal_data?.dob}
                          </Alert>
                          <Alert size="sm" icon={FiClock}>
                            {new Date(
                              certificate?.participant?.updated_at
                            ).toLocaleString()}
                          </Alert>
                        </main>
                      </AccordionCard>
                    </div>
                  )
              )}
            </Row>
            <Alert marginBottom="sm" icon={FiAlertCircle} size="md" type="info">
              Exibindo{' '}
              <b>
                últimos{' '}
                {!showAll && certificates.length > 4 ? 4 : certificates.length}{' '}                                                                                            </b>
              participantes adicionados. Até agora{' '}
              <b>foram adicionados {certificates.length}</b>.
            </Alert>
            {certificates.length > 4 && (
              <Button
                size="small"
                color="secondary"
                ghost
                inline
                onClick={() => {
                  setShowAll(oldValue => !oldValue)
                }}
                type="button"
              >
                {showAll ? (
                  <>
                    <FiChevronUp size={20} />
                    <span>Mostrar menos</span>
                  </>
                ) : (
                  <>
                    <FiChevronDown size={20} />
                    <span>Mostrar mais</span>
                  </>
                )}
              </Button>
            )}
          </>
        )}
      </Section>
      <Footer>
        <div>
          <Button
            size="default"
            color="secondary"
            outline
            onClick={() => {
              formRef.current.reset()
              formRef.current.setErrors({})
              handleReset()
              closeAccordion()
            }}
            type="button"
          >
            <FiX size={20} />
            <span>Fechar</span>
          </Button>
        </div>
      </Footer>
    </Form>
  )
}
export default CertificateForm
