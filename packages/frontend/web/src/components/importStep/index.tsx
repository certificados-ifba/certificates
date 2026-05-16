import {
  Accordion,
  Alert,
  Button,
  ProgressBar,
  Spinner,
  Table,
  TableRow
} from '@components'
import { theme } from '@styles'
import {
  getData,
  IStatus,
  readSheet,
  ReturnData,
  formatDate,
  sendData,
  IDataSheet,
  isDate,
  downloadInconsistencies
} from '@utils'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  FiAlertCircle,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiDownload,
  FiSend
} from 'react-icons/fi'
import { AnySchema } from 'yup'

import {
  Info,
  PaginateList,
  PageSizeSelect,
  Pagination,
  ProgressWrapper
} from './styles'

interface Props {
  file: File
  url: string
  schema: AnySchema
  dataSheet: IDataSheet[]
  onFinished: () => void
  filename?: string
}

const initialStatus: IStatus = {
  percentage: 0,
  message: 'Iniciando...',
  type: 'waiting',
  successes: 0,
  errors: 0
}

const perPageOptions = [
  {
    value: 10,
    label: '10'
  },
  {
    value: 20,
    label: '20'
  },
  {
    value: 50,
    label: '50'
  }
]

export const ImportStep: React.FC<Props> = ({
  file,
  url,
  schema,
  dataSheet,
  onFinished,
  filename
}) => {
  const [status, setStatus] = useState<IStatus>(initialStatus)
  const [registers, setRegisters] = useState<ReturnData[]>([])
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(perPageOptions[0])
  const [
    isDownloadingInconsistencies,
    setIsDownloadingInconsistencies
  ] = useState(false)

  const numberOfRegisters = useMemo(() => registers.length, [registers])

  const numberOfPages = useMemo(
    () => Math.max(1, Math.ceil(numberOfRegisters / perPage.value)),
    [numberOfRegisters, perPage.value]
  )

  const paginatedRegisters = useMemo(() => {
    const start = (page - 1) * perPage.value
    const end = start + perPage.value
    return registers.slice(start, end)
  }, [registers, page, perPage.value])

  const hasPreviousPage = page > 1
  const hasNextPage = page < numberOfPages

  const pages = useMemo(() => {
    const list = []
    for (let index = 1; index <= numberOfPages; index++) {
      const upper = page + (page < 5 ? 7 - page : 3)
      const lower =
        page - (page + 3 > numberOfPages ? page + 6 - numberOfPages : 3)
      if (
        (index > lower && index < upper) ||
        index === 1 ||
        index === Number(numberOfPages)
      ) {
        list.push({
          value:
            (index - 1 > lower && index + 1 < upper) ||
            index < 3 ||
            index > numberOfPages - 2
              ? index
              : 0,
          label:
            (index - 1 > lower && index + 1 < upper) ||
            index < 3 ||
            index > numberOfPages - 2
              ? String(index)
              : '...'
        })
      }
    }
    return list
  }, [page, numberOfPages])

  const resetPage = useCallback(() => {
    setPage(1)
  }, [])

  const loadPrevious = useCallback(() => {
    setPage(oldPage => Math.max(oldPage - 1, 1))
  }, [])

  const loadNext = useCallback(() => {
    setPage(oldPage => Math.min(oldPage + 1, numberOfPages))
  }, [numberOfPages])

  const loadLast = useCallback(() => {
    setPage(numberOfPages)
  }, [numberOfPages])

  const goToPage = useCallback(
    (value: number) => {
      if (value < 1 || value > numberOfPages) return
      setPage(value)
    },
    [numberOfPages]
  )

  const handlePerPage = useCallback(option => {
    setPerPage(option)
    setPage(1)
  }, [])

  useEffect(() => {
    setPage(1)
  }, [registers])

  useEffect(() => {
    if (page > numberOfPages) setPage(numberOfPages)
  }, [page, numberOfPages])
  const handleDownloadInconsistencies = async () => {
    setIsDownloadingInconsistencies(true)
    const baseName = filename ?? url.replace(/\//g, '-')
    await downloadInconsistencies(
      registers,
      dataSheet,
      `inconsistencias-${baseName}`
    )
    setIsDownloadingInconsistencies(false)
  }

  const getCell = (value: string | boolean) => {
    if (typeof value === 'boolean') return value ? 'Sim' : 'Não'
    if (isDate(value)) return formatDate(value, false, true)
    return value
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        setStatus(status => ({
          ...status,
          message: 'Lendo arquivo...',
          type: 'loading'
        }))

        let data = await getData(await readSheet(file), setStatus, schema)
        setRegisters(data)
        data = await sendData(data, url, setStatus)
        setRegisters(data)

        setStatus(({ successes, errors, ...rest }) => ({
          ...rest,
          successes: successes,
          errors: errors,
          percentage: 100,
          message:
            successes > 0
              ? 'Importação finalizada'
              : 'Nenhum registro foi importado',
          type: successes > 0 ? 'done' : 'error',
          info: `${successes} importado(s) | ${errors} erro(s)`
        }))
      } catch (error) {
        console.error(error?.message)
        setStatus(status => ({
          ...status,
          percentage: 100,
          message: 'Erro ao ler o arquivo',
          type: 'error'
        }))
      } finally {
        onFinished()
      }
    }
    if (status.type === 'waiting') loadData()
  }, [file, status.type, onFinished, url, schema])

  const { percentage, message, type, info, errors } = status

  const Icon = type === 'error' ? FiAlertCircle : FiCheckCircle

  return (
    <div>
      <ProgressWrapper>
        <i>
          {type === 'loading' ? (
            <Spinner size={70} />
          ) : (
            <Icon
              color={
                type === 'error' ? theme.colors.danger : theme.colors.success
              }
              size={70}
            />
          )}
        </i>
        <h2>{message}</h2>
        <ProgressBar width={percentage} />
        <Info>{info}</Info>
        {errors > 0 && type !== 'loading' && (
          <Alert type="danger" card marginBottom="xs">
            Houve <b>{errors} erro(s)</b> na importação. Verifique o(s)
            registro(s) para mais informações.
          </Alert>
        )}
        {errors > 0 && type !== 'loading' && (
          <Button
            outline
            color="danger"
            size="small"
            loading={isDownloadingInconsistencies}
            onClick={handleDownloadInconsistencies}
            marginBottom="md"
          >
            <FiDownload size={20} />
            <span>Baixar planilha de Inconsistências</span>
          </Button>
        )}
      </ProgressWrapper>
      <Accordion title="Registros">
        <Table>
          <thead>
            <tr>
              {dataSheet
                .filter(({ column }) => !column?.hidden)
                .map(({ column }, key) => (
                  <td key={key}>{column?.header}</td>
                ))}
              <td>Status</td>
            </tr>
          </thead>
          <tbody>
            {paginatedRegisters.length > 0 &&
              paginatedRegisters?.map(({ data, status, message }, key) => {
                  const Icon =
                    status === 'not-send'
                      ? FiSend
                      : status === 'error'
                      ? FiAlertCircle
                      : FiCheckCircle
                  const color =
                    theme.colors[
                      status === 'not-send'
                        ? 'secondary'
                        : status === 'error'
                        ? 'danger'
                        : 'success'
                    ]
                  return (
                    <tr
                      style={{
                        color:
                          status === 'error'
                            ? theme.colors.danger
                            : theme.colors.darkShade
                      }}
                      key={key}
                    >
                      {dataSheet
                        .filter(({ column }) => !column?.hidden)
                        .map(({ column }, key) => (
                          <td key={key}>{getCell(data[column.key])}</td>
                        ))}
                      <td>
                        <TableRow>
                          <Icon color={color} />
                          <small>{message}</small>
                        </TableRow>
                      </td>
                    </tr>
                  )
                }
              )}
          </tbody>
        </Table>
        {numberOfRegisters > 0 && (
          <Pagination>
            <div>
              <span className="hide-md-down">Linhas por página</span>
              <PageSizeSelect
                menuPosition="fixed"
                instanceId="import-per-page"
                classNamePrefix="react-select"
                isSearchable={false}
                onChange={handlePerPage}
                defaultValue={perPage}
                value={perPage}
                options={perPageOptions}
              />
            </div>
            <span className="hide-md-down">
              {`${1 + (page - 1) * perPage.value} - ${
                !hasNextPage ? numberOfRegisters : page * perPage.value
              } de ${numberOfRegisters}`}
            </span>
            <nav>
              <Button
                ghost
                square
                size="small"
                color="dark"
                disabled={!hasPreviousPage}
                onClick={resetPage}
              >
                <FiChevronsLeft size={18} />
              </Button>
              <Button
                ghost
                square
                size="small"
                color="dark"
                disabled={!hasPreviousPage}
                onClick={loadPrevious}
              >
                <FiChevronLeft size={18} />
              </Button>
              <PaginateList className="hide-md-down">
                {pages.map(({ value, label }, key) => (
                  <Button
                    key={key}
                    ghost
                    square
                    size="small"
                    color="dark"
                    disabled={value === 0 || value === page}
                    onClick={() => goToPage(value)}
                  >
                    <span>{label}</span>
                  </Button>
                ))}
              </PaginateList>
              <Button
                ghost
                square
                size="small"
                color="dark"
                disabled={!hasNextPage}
                onClick={loadNext}
              >
                <FiChevronRight size={18} />
              </Button>
              <Button
                ghost
                square
                size="small"
                color="dark"
                disabled={!hasNextPage}
                onClick={loadLast}
              >
                <FiChevronsRight size={18} />
              </Button>
            </nav>
          </Pagination>
        )}
      </Accordion>
    </div>
  )
}
