/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable react/display-name */
import { FormHandles } from '@unform/core'
import { Form } from '@unform/web'
import { useCallback, useEffect, useRef, useState } from 'react'
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
  FiX,
  FiPlus,
  FiSearch,
  FiChevronsLeft,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsRight
} from 'react-icons/fi'
import { components } from 'react-select'
import * as Yup from 'yup'

import { IActivity } from '../../dtos/IActivity'
import { IEvent } from '../../dtos/IEvent'
import { IGeneric } from '../../dtos/IGeneric'
import { IParticipant } from '../../dtos/IParticipant'
import { useCertificates } from '../../providers/certificates'
import { useToast } from '../../providers/toast'
import api from '../../services/axios'
import { usePaginatedRequest } from '../../services/usePaginatedRequest'
import { Footer, Section } from '../../styles/components/accordion'
import {
  InfoOption,
  TitleOption
} from '../../styles/components/accordions/participationForm'
import { Divider } from '../../styles/components/divider'
import { Row } from '../../styles/components/grid'
import { Badge, Group, IconArea } from '../../styles/components/select'
import { theme } from '../../styles/theme'
import { capitalize } from '../../utils/capitalize'
import { getValidationErrors } from '../../utils/getValidationErrors'
import { AccordionCard } from '../accordionCard'
import { Alert } from '../alert'
import { AsyncSelect } from '../asyncSelect'
import { Button } from '../button'
import { Input } from '../input'
import { Spinner } from '../spinner'
import { Table } from '../table'
import { TableRow } from '../tableRow'
import CertificateInfo from './certificateInfo'
const maskCpf = (cpf: string): string => {
  if (!cpf) return ''
  const clean = cpf.replace(/\D/g, '')
  if (clean.length !== 11) return cpf
  return `***.${clean.slice(3, 6)}.${clean.slice(6, 9)}-**`
}

interface Props {
  event: IEvent
  closeAccordion: () => void
}

const CertificateForm: React.FC<Props> = ({ event, closeAccordion }) => {
  const [showAll, setShowAll] = useState(false)
  const [filters, setFilters] = useState(null)
  const { addToast } = useToast()
  const { certificates, isEmpty, handleAdd, handleReset } = useCertificates()
  const formRef = useRef<FormHandles>(null)
  const searchFormRef = useRef<FormHandles>(null)

  const participantsRequest = usePaginatedRequest<any, any>({
    url: 'participants',
    params: filters
      ? { ...filters, sort_by: 'name', order_by: 'ASC' }
      : { sort_by: 'name', order_by: 'ASC' }
  })

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
        addToast({
          type: 'success',
          title: 'Participante adicionado',
          description: 'O participante foi adicionado com sucesso'
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

  const handleFilter = useCallback(
    data => {
      setFilters(data)
      participantsRequest.resetPage()
    },
    [participantsRequest]
  )

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
        <SearchForm>
          <Form ref={searchFormRef} onSubmit={handleFilter}>
            <Input
              name="search"
              placeholder="Buscar participante"
              icon={FiSearch}
            />
          </Form>
        </SearchForm>
        <Table>
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
            {(!participantsRequest.data ||
              participantsRequest.data?.data?.length === 0) &&
            !participantsRequest.error ? (
              <tr>
                <td
                  colSpan={5}
                  style={{ textAlign: 'center', padding: '40px' }}
                >
                  <Spinner size={50} color={theme.colors.secondary} />
                </td>
              </tr>
            ) : participantsRequest.data?.data?.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{ textAlign: 'center', padding: '20px' }}
                >
                  Nenhum participante encontrado
                </td>
              </tr>
            ) : (
              participantsRequest.data?.data?.map(participant => (
                <tr key={participant.id}>
                  <td>{capitalize(participant.name)}</td>
                  <td>{maskCpf(participant.personal_data?.cpf)}</td>
                  <td>{participant.email}</td>
                  <td>{participant.personal_data?.dob}</td>
                  <td>
                    <TableRow>
                      <Button
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
              ))
            )}
          </tbody>
        </Table>
        <Pagination>
          <div>
            <span className="hide-md-down">Linhas por página</span>
            <Select
              menuPosition="fixed"
              instanceId="perPage"
              isSearchable={false}
              onChange={participantsRequest.handlePerPage}
              defaultValue={participantsRequest.perPage}
              value={participantsRequest.perPage}
              options={[
                { value: 5, label: '5' },
                { value: 10, label: '10' },
                { value: 25, label: '25' },
                { value: 50, label: '50' }
              ]}
            />
          </div>
          <span className="hide-md-down">
            {`${
              !participantsRequest.data ||
              participantsRequest.data?.data?.length === 0
                ? 0
                : 1 +
                  (participantsRequest.page - 1) *
                    participantsRequest.perPage.value
            } - ${
              !participantsRequest.data
                ? 0
                : !participantsRequest.hasNextPage
                ? participantsRequest.response?.headers['x-total-count']
                : participantsRequest.page * participantsRequest.perPage.value
            } de ${
              !participantsRequest.data
                ? 0
                : participantsRequest.response?.headers['x-total-count']
            }`}
          </span>
          <nav>
            <Button
              ghost
              square
              size="small"
              color="dark"
              disabled={!participantsRequest.hasPreviousPage}
              onClick={participantsRequest.resetPage}
            >
              <FiChevronsLeft size={18} />
            </Button>
            <Button
              ghost
              square
              size="small"
              color="dark"
              disabled={!participantsRequest.hasPreviousPage}
              onClick={participantsRequest.loadPrevious}
            >
              <FiChevronLeft size={18} />
            </Button>
            <Button
              ghost
              square
              size="small"
              color="dark"
              disabled={!participantsRequest.hasNextPage}
              onClick={participantsRequest.loadNext}
            >
              <FiChevronRight size={18} />
            </Button>
            <Button
              ghost
              square
              size="small"
              color="dark"
              disabled={!participantsRequest.hasNextPage}
              onClick={() =>
                participantsRequest.goToPage(
                  Number(participantsRequest.response?.headers['x-total-page'])
                )
              }
            >
              <FiChevronsRight size={18} />
            </Button>
          </nav>
        </Pagination>
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
                {!showAll && certificates.length > 4 ? 4 : certificates.length}{' '}
              </b>
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
