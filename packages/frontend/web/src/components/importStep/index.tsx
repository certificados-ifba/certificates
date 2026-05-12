import {
  Accordion,
  Alert,
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
  isDate
} from '@utils'
import { useEffect, useState } from 'react'
import { FiAlertCircle, FiCheckCircle, FiSend } from 'react-icons/fi'
import { AnySchema } from 'yup'

import { Info, ProgressWrapper } from './styles'

interface Props {
  file: File
  url: string
  schema: AnySchema
  dataSheet: IDataSheet[]
  onFinished: () => void
}

const initialStatus: IStatus = {
  percentage: 0,
  message: 'Iniciando...',
  type: 'waiting',
  successes: 0,
  errors: 0
}

export const ImportStep: React.FC<Props> = ({
  file,
  url,
  schema,
  dataSheet,
  onFinished
}) => {
  const [status, setStatus] = useState<IStatus>(initialStatus)
  const [registers, setRegisters] = useState<ReturnData[]>([])

  const getCell = (value: string | boolean, col: string, errors: string[]) => {
    if (errors?.find(error => error === col))
      return (
        <TableRow>
          <FiAlertCircle color={theme.colors.danger} />
          <small>{value}</small>
        </TableRow>
      )
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
            Houve <b>{errors} erro(s)</b> na importação. Verifique os
            registros para mais informações.
          </Alert>
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
              <td />
            </tr>
          </thead>
          <tbody>
            {registers.length > 0 &&
              registers?.map(({ data, status, message, errors }, key) => {
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
                        <td key={key}>
                          {getCell(data[column.key], column.key, errors)}
                        </td>
                      ))}
                    <td>
                      <TableRow>
                        <Icon color={color} />
                        <small>{message}</small>
                      </TableRow>
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </Table>
      </Accordion>
    </div>
  )
}
