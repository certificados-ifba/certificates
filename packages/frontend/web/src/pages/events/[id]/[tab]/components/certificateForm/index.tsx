import {
  AsyncSelect,
  Button,
  Grid,
  Input,
  Accordion,
  Divider,
  PaginatedTable,
  TableRow
} from '@components'
import { Badge, Group, IconArea } from '@components/select/styles'
import { IActivity, IEvent, IGeneric, IParticipant } from '@dtos'
import { useToast } from '@providers'
import { api, usePaginatedRequest } from '@services'
import { FormHandles } from '@unform/core'
import { Form } from '@unform/web'
import { capitalize, getValidationErrors, maskDob, maskEmail } from '@utils'
import { useCallback, useRef, useState } from 'react'
import {
  FiAlignCenter,
  FiBook,
  FiBriefcase,
  FiCalendar,
  FiClock,
  FiFileText,
  FiX,
  FiPlus,
  FiSearch
} from 'react-icons/fi'
import { components } from 'react-select'
import * as Yup from 'yup'

import { InfoOption, TitleOption } from './styles'

const { Section, Footer } = Accordion
const maskCpf = (cpf: string): string => {
  if (!cpf) return ''
  const clean = cpf.replace(/\D/g, '')
  if (clean.length !== 11) return cpf
  return `***.${clean.slice(3, 6)}.${clean.slice(6, 9)}-**`
}

interface Props {
  event: IEvent
  closeAccordion: () => void
  onParticipantSaved?: () => void
}

export const CertificateForm: React.FC<Props> = ({ event, onParticipantSaved }) => {
  const [filters, setFilters] = useState(null)
  const { addToast } = useToast()
  const formRef = useRef<FormHandles>(null)
  const participantsRequest = usePaginatedRequest<any, any>({
    url: 'participants',
    params: filters
      ? { ...filters, sort_by: 'name', order_by: 'ASC' }
      : { sort_by: 'name', order_by: 'ASC' }
  })

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
        await api.post(`events/${event?.id}/certificates`, {
          activity,
          function: _function,
          participant: participant.id,
          workload,
          start_date,
          end_date,
          authorship_order,
          additional_field
        })
        addToast({
          type: 'success',
          title: 'Participante cadastrado',
          description: `${participant.name} foi cadastrado(a) com sucesso no evento.`,
          fixed: true
        })
        if (onParticipantSaved) onParticipantSaved()
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err)
          formRef.current?.setErrors(errors)
          return
        }
        addToast({
          type: 'error',
          title: 'Erro ao cadastrar a participação',
          description: err
        })
      }
    },
    [addToast, event?.id, onParticipantSaved]
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
        `events/${event?.id}/activities`,
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

  const handleParticipantSearch = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const search = event.target.value.trim()

      setFilters(search ? { search } : null)
      participantsRequest.resetPage()
    },
    [participantsRequest]
  )

  const handleSearchKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') event.preventDefault()
    },
    []
  )

  return (
    <Form
      ref={formRef}
      onSubmit={data => {
        console.log(data)
      }}
    >
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
        <Grid cols={3}>
          <AsyncSelect
            marginBottom="sm"
            label="Função"
            // formRef={formRef}
            name="function"
            loadOptions={loadFunctions}
            icon={FiBriefcase}
          />
          <Input
            type="date"
            // formRef={formRef}
            name="start_date"
            label="Inicia em"
            marginBottom="sm"
            placeholder="Data de Início"
            icon={FiCalendar}
          />
          <Input
            marginBottom="sm"
            type="date"
            // formRef={formRef}
            name="end_date"
            label="Termina em"
            placeholder="Data Final"
            icon={FiCalendar}
          />
          <Input
            type="number"
            // formRef={formRef}
            name="workload"
            label="Carga Horária"
            marginBottom="sm"
            placeholder="Carga Horária em Horas"
            icon={FiClock}
          />
          <Input
            marginBottom="sm"
            type="text"
            // formRef={formRef}
            name="authorship_order"
            label="Ordem Autoria"
            placeholder="Ordem Autoria"
            icon={FiBook}
          />
          <Input
            marginBottom="sm"
            type="text"
            // formRef={formRef}
            name="additional_field"
            label="Texto Adicional"
            placeholder="Texto Adicional"
            icon={FiAlignCenter}
          />
        </Grid>
      </Section>
      <Divider />
      <header>
        <h2>Quem participou?</h2>
      </header>
      <Section paddingBottom="md">
        <Input
          name="search"
          placeholder="Buscar participante"
          icon={FiSearch}
          onChange={handleParticipantSearch}
          onKeyDown={handleSearchKeyDown}
        />
        <PaginatedTable request={participantsRequest}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>Email</th>
              <th>Data Nascimento</th>
              <th style={{ width: 32 }} />
            </tr>
          </thead>
          <tbody>
            {participantsRequest.data?.data?.map(participant => (
              <tr key={participant.id}>
                <td>{capitalize(participant.name)}</td>
                <td>{maskCpf(participant.personal_data?.cpf)}</td>
                <td>{maskEmail(participant.email)}</td>
                <td>{maskDob(participant.personal_data?.dob)}</td>
                <td>
                  <TableRow>
                    <Button
                      type="button"
                      ghost
                      inline
                      square
                      color="success"
                      size="small"
                      onClick={() => handleParticipantSelect(participant)}
                    >
                      <FiPlus size={20} />
                    </Button>
                  </TableRow>
                </td>
              </tr>
            ))}
          </tbody>
        </PaginatedTable>
      </Section>
    </Form>
  )
}
