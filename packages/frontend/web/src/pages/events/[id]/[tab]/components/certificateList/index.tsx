import {
  AdvancedFilters,
  Alert,
  Button,
  Column,
  DeleteModal,
  AsyncSelect,
  FilterInput,
  PaginatedTable,
  TableRow
} from '@components'
import { IActivity, IEvent, IGeneric, IParticipant } from '@dtos'
import { useAdvancedFilters } from '@hooks'
import { useToast } from '@providers'
import { api, usePaginatedRequest } from '@services'
import { capitalize } from '@utils'
import { useRouter } from 'next/router'
import { useCallback, useMemo, useState } from 'react'
import {
  FiActivity,
  FiBook,
  FiBookOpen,
  FiBriefcase,
  FiDownload,
  FiExternalLink,
  FiFilePlus,
  FiMinusCircle,
  FiSearch
} from 'react-icons/fi'

interface Props {
  event: IEvent
  openAccordion: () => void
}

const maskCpf = (cpf: string): string => {
  if (!cpf) return ''
  const clean = cpf.replace(/\D/g, '')
  if (clean.length !== 11) return cpf
  return `***.${clean.slice(3, 6)}.${clean.slice(6, 9)}-**`
}
interface ICertificate {
  id: string
  activity: IActivity
  function: IGeneric
  participant: IParticipant
  event: Event
  key: string
  workload: number
  start_date: Date
  end_date: Date
  authorship_order: string
  additional_field: string
  created_at: Date
  updated_at: Date
}

interface IRequest {
  data: ICertificate[]
}

interface IModelCriterion {
  function: IGeneric
  type_activity: IGeneric
}

interface IModel {
  id: string
  name: string
  pages: Array<{
    type: string
    image: string
    text: string
    layout?: any
  }>
  criterions?: IModelCriterion[]
  is_default?: boolean
}

const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:4001'

const formatDateRange = (startDate: Date | string, endDate: Date | string) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  }

  return `${start.toLocaleDateString(
    'pt-BR',
    options
  )} a ${end.toLocaleDateString('pt-BR', options)}`
}

const getRefId = (value: any) => String(value?.id || value?._id || value || '')

const substituteCertificateText = (
  html: string,
  event: IEvent,
  certificate: ICertificate,
  generationData: { tipoAtividade: string; funcao: string }
) => {
  if (!html) return ''

  return html
    .replace(/\[participante_nome\]/g, certificate.participant?.name || '')
    .replace(/\[evento_nome\]/g, event?.name || '')
    .replace(/\[evento_sigla\]/g, event?.initials || '')
    .replace(/\[evento_edicao\]/g, event?.edition || '')
    .replace(
      /\[participacao_periodo\]/g,
      formatDateRange(certificate.start_date, certificate.end_date)
    )
    .replace(
      /\[participacao_carga_horaria\]/g,
      `${certificate.workload || ''} horas`
    )
    .replace(
      /\[participacao_ordem_autoria\]/g,
      certificate.authorship_order || ''
    )
    .replace(
      /\[participacao_texto_adicional\]/g,
      certificate.additional_field || ''
    )
    .replace(/\[tipo_atividade\]/g, generationData.tipoAtividade)
    .replace(/\[tipo_funcao\]/g, generationData.funcao)
    .replace(/\[criterioVisualizado\]/g, generationData.funcao)
}

const buildCertificateHtml = (
  model: IModel,
  event: IEvent,
  certificate: ICertificate,
  generationData: { tipoAtividade: string; funcao: string }
) => {
  const pages = model.pages || []

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>${model.name} - ${certificate.participant?.name || ''}</title>
    <style>
      @page { size: A4 landscape; margin: 0; }
      * { box-sizing: border-box; }
      body { margin: 0; color: #1f2933; font-family: Georgia, "Times New Roman", serif; }
      .page { width: 297mm; height: 210mm; position: relative; overflow: hidden; page-break-after: always; }
      .background { height: 100%; width: 100%; object-fit: cover; position: absolute; inset: 0; }
      .content { align-items: center; display: flex; height: 100%; justify-content: center; padding: 15mm; position: relative; text-align: center; z-index: 1; }
      .content > div { width: 100%; }
      .validation { bottom: 8mm; font-family: Arial, sans-serif; font-size: 9px; left: 0; position: absolute; right: 0; text-align: center; z-index: 2; }
      @media print { .page { page-break-after: always; } }
    </style>
  </head>
  <body>
    ${pages
      .map(page => {
        const image = page.image ? `${storageUrl}/upload/${page.image}` : ''
        const text = substituteCertificateText(
          page.text,
          event,
          certificate,
          generationData
        )

        return `<section class="page">
      ${image ? `<img class="background" src="${image}" alt="" />` : ''}
      <div class="content"><div>${text}</div></div>
      ${
        page.type === 'frente'
          ? `<div class="validation">Código: <strong>${certificate.key}</strong></div>`
          : ''
      }
    </section>`
      })
      .join('')}
  </body>
</html>`
}

export const CertificateList: React.FC<Props> = ({ event, openAccordion }) => {
  const router = useRouter()
  const filtersState = useAdvancedFilters(
    `event-certificates-filters:${event?.id}`
  )
  const [column, setColumn] = useState('created_at')
  const [order, setOrder] = useState<'' | 'ASC' | 'DESC'>('DESC')
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [id, setId] = useState('')

  const { addToast } = useToast()

  const requestParams = useMemo(
    () => {
      const filters = {
        ...filtersState.filters,
        activity: Array.isArray(filtersState.filters.activity)
          ? filtersState.filters.activity.join(',')
          : filtersState.filters.activity
      }

      return order !== ''
        ? { ...filters, sort_by: column, order_by: order }
        : filters
    },
    [column, filtersState.filters, order]
  )

  const request = usePaginatedRequest<IRequest>({
    url: `events/${event?.id}/certificates`,
    params: requestParams
  })

  const resultCount = request.response?.headers['x-total-count']

  const loadFunctions = useCallback(async search => {
    const response = await api.get<{ data: IGeneric[] }>('/functions', {
      params: { search, sort_by: 'name', order_by: 'ASC' }
    })

    return (response.data?.data || []).map(_function => ({
      value: _function.id,
      label: capitalize(_function.name)
    }))
  }, [])

  const loadTypeActivities = useCallback(async search => {
    const response = await api.get<{ data: IGeneric[] }>('/activity_types', {
      params: { search, sort_by: 'name', order_by: 'ASC' }
    })

    return (response.data?.data || []).map(typeActivity => ({
      value: typeActivity.id,
      label: capitalize(typeActivity.name)
    }))
  }, [])

  const handleApplyFilters = useCallback(
    (nextDraft?: Record<string, any>) => {
      request.resetPage()
      filtersState.apply(nextDraft)
    },
    [filtersState, request]
  )

  const handleClearFilters = useCallback(() => {
    request.resetPage()
    filtersState.clear()
  }, [filtersState, request])

  const handleDebouncedFilter = useCallback(
    (name: string, value: string) => {
      handleApplyFilters({ ...filtersState.draft, [name]: value })
    },
    [filtersState.draft, handleApplyFilters]
  )

  const handleSelectAsyncFilter = useCallback(
    (name: string) => (data: { label: string; value: string } | null) => {
      const value = data?.label ? String(data.label) : ''

      filtersState.setField(name, value)
      handleApplyFilters({ ...filtersState.draft, [name]: value })
    },
    [filtersState, handleApplyFilters]
  )

  const handleOrder = useCallback(
    columnSelected => {
      if (column !== columnSelected) {
        setColumn(columnSelected)
        setOrder('ASC')
      } else {
        setOrder(value =>
          value === '' ? 'ASC' : value === 'ASC' ? 'DESC' : ''
        )
      }
    },
    [column]
  )

  const handleCloseDeleteModal = useCallback(() => {
    setOpenDeleteModal(false)
    setId('')
  }, [])

  const handleSubmitDelete = useCallback(async () => {
    try {
      await api.delete(`events/${event?.id}/certificates/${id}`)
      addToast({
        title: 'Certificado excluido',
        type: 'success',
        description: 'Certificado excluído com sucesso.'
      })
      request.revalidate()
      setOpenDeleteModal(false)
    } catch (err) {
      addToast({
        title: 'Erro na exclusão',
        type: 'error',
        description: err
      })
    }
  }, [event, addToast, request, id])

  const handleDownloadCertificate = useCallback(
    async (certificate: ICertificate) => {
      try {
        const modelsResponse = await api.get<{ data: IModel[] }>(
          `events/${event?.id}/models`
        )
        const models = modelsResponse.data?.data || []

        if (models.length === 0) {
          addToast({
            type: 'error',
            title: 'Modelo de certificado ausente',
            description:
              'É necessário definir um modelo de certificado para realizar o download.'
          })
          return
        }

        const activityTypeId = getRefId(certificate.activity?.type)
        const functionId = getRefId(certificate.function)
        const selectedModel =
          models.find(model =>
            model.criterions?.some(
              criterion =>
                getRefId(criterion.type_activity) === activityTypeId &&
                getRefId(criterion.function) === functionId
            )
          ) || models.find(model => model.is_default)

        if (!selectedModel) {
          addToast({
            type: 'error',
            title: 'Modelo de certificado ausente',
            description:
              'É necessário definir um modelo de certificado para realizar o download.'
          })
          return
        }

        const tipoAtividade = certificate.activity?.type?.name || ''
        const criterioVisualizado = certificate.function?.name || ''
        const html = buildCertificateHtml(selectedModel, event, certificate, {
          tipoAtividade,
          funcao: criterioVisualizado
        })
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')

        link.href = url
        link.download = `certificado-${certificate.participant?.name || certificate.id}.html`
        document.body.appendChild(link)
        link.click()
        link.remove()
        URL.revokeObjectURL(url)
      } catch (err) {
        addToast({
          type: 'error',
          title: 'Erro ao baixar certificado',
          description: err
        })
      }
    },
    [addToast, event]
  )

  return (
    <>
      <header>
        <h2>Participantes</h2>
        {event?.status !== 'PUBLISHED' && (
          <Button
            inline
            color="info"
            size="small"
            onClick={() => {
              router.push(`/events/${event?.id}/certificates/import`)
            }}
          >
            <FiFilePlus size={20} />
            <span>Importar via Planilha</span>
          </Button>
        )}
      </header>
      <AdvancedFilters
        activeCount={filtersState.activeCount}
        isLoading={request.isValidating}
        resultsCount={resultCount}
        onApply={() => handleApplyFilters()}
        onClear={handleClearFilters}
      >
        <FilterInput
          name="search"
          placeholder="Buscar nome ou CPF"
          label="Participante"
          icon={FiSearch}
          value={filtersState.draft.search}
          onChangeValue={filtersState.setField}
          onDebouncedChange={handleDebouncedFilter}
        />
        <FilterInput
          name="activity"
          placeholder="Filtrar por atividade"
          label="Atividade"
          icon={FiBook}
          value={filtersState.draft.activity}
          onChangeValue={filtersState.setField}
          onDebouncedChange={handleDebouncedFilter}
        />
        <AsyncSelect
          name="typeActivity"
          label="Tipo de Atividade"
          icon={FiBookOpen}
          placeholder="Filtrar por tipo de atividade"
          value={
            filtersState.draft.typeActivity
              ? {
                  label: String(filtersState.draft.typeActivity),
                  value: String(filtersState.draft.typeActivity)
                }
              : null
          }
          loadOptions={loadTypeActivities}
          handleOnSelect={handleSelectAsyncFilter('typeActivity')}
          isCreatable
          allowCreateWhileLoading
          formatCreateLabel={text => `Usar "${text}"`}
        />
        <AsyncSelect
          name="function"
          label="Função"
          icon={FiBriefcase}
          placeholder="Filtrar por função"
          value={
            filtersState.draft.function
              ? {
                  label: String(filtersState.draft.function),
                  value: String(filtersState.draft.function)
                }
              : null
          }
          loadOptions={loadFunctions}
          handleOnSelect={handleSelectAsyncFilter('function')}
          isCreatable
          allowCreateWhileLoading
          formatCreateLabel={text => `Usar "${text}"`}
        />
      </AdvancedFilters>
      <PaginatedTable request={request}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>CPF</th>
            <th>Atividade</th>
            <th>Tipo de Atividade</th>
            <th>Função</th>
            <th>Carga Horária</th>
            <th>Data Início</th>
            <th>Data Fim</th>
            <th onClick={() => handleOrder('created_at')}>
              <Column order={order} selected={column === 'created_at'}>
                Incluído Em
              </Column>
            </th>
            <th style={{ width: 32 }} />
          </tr>
        </thead>
        <tbody>
          {request.data?.data?.map(cert => {
            const { id, participant = null, workload, start_date, end_date, created_at } = cert

            const activityName = cert.activity?.name || ''
            const activityTypeName = cert.activity?.type?.name || ''
            const participantName = participant?.name || ''
            const cpf = participant?.personal_data?.cpf || ''
            const functionName = cert.function?.name || ''

            return (
              <tr key={id}>
                <td>{participantName}</td>
                <td>{maskCpf(cpf)}</td>
                <td>{activityName}</td>
                <td>{activityTypeName}</td>
                <td>{capitalize(functionName)}</td>
                <td>
                  {workload} Hora{Number(workload) > 1 && 's'}
                </td>
                <td>{new Date(start_date).toLocaleDateString()}</td>
                <td>{new Date(end_date).toLocaleDateString()}</td>
                <td>{new Date(created_at).toLocaleString()}</td>
                <td>
                  <TableRow>
                    <Button
                      inline
                      ghost
                      square
                      color="success"
                      size="small"
                      onClick={() => {
                        //   setCertificateSelected(act.id)
                        //   setNameActivitySelected(act.name)
                        //   setOpenDeleteModal(true)
                      }}
                    >
                      <FiExternalLink size={20} />
                    </Button>
                    <Button
                      inline
                      ghost
                      square
                      color="info"
                      size="small"
                      onClick={() => {
                        handleDownloadCertificate(cert)
                      }}
                    >
                      <FiDownload size={20} />
                    </Button>
                    <Button
                      inline
                      ghost
                      square
                      color="danger"
                      size="small"
                      onClick={() => {
                        setId(id)
                        setOpenDeleteModal(true)
                      }}
                    >
                      <FiMinusCircle size={20} />
                    </Button>
                  </TableRow>
                </td>
              </tr>
            )
          })}
        </tbody>
      </PaginatedTable>
      <DeleteModal
        handleSubmit={handleSubmitDelete}
        name="Participação"
        openModal={openDeleteModal}
        onClose={handleCloseDeleteModal}
      >
        <Alert>Tem certeza que você deseja excluir?</Alert>
      </DeleteModal>
    </>
  )
}
