import {
  Accordion,
  Alert,
  Button,
  FileSelected,
  ProgressBar,
  Spinner,
  Table,
  TableRow,
  Tooltip
} from '@components'
import { api } from '@services'
import { theme } from '@styles'
import { formatPhone, getValidationErrors } from '@utils'
import { useCallback, useState } from 'react'
import {
  FiAlertCircle,
  FiCheck,
  FiCheckCircle,
  FiChevronLeft,
  FiSend
} from 'react-icons/fi'
import XLSX from 'xlsx'
import * as Yup from 'yup'

import { column_value_enum, Column, ExtraBody, Enum } from '../interfaces'
import { CardHeader, Info, Section } from './styles'

interface Props {
  columns?: Column[]
  extraParams?: ExtraBody[]
  sendURL: string
  enums: Enum[]
  file: FileSelected
  title: string
  onNext: () => void
  onPrevious: () => void
  createSchema?: (item: any) => any
}

const ColumnValueResponse: React.FC<{
  col: Column
  value: any
  enums: Enum[]
  errors: any
}> = ({ col, value, enums, errors }) => {
  let val: string
  let messageError: string
  if (errors[col.key]) {
    messageError = errors[col.key]
  } else if (col.type === 'date') {
    val = value[col.key] ? value[col.key].toLocaleDateString() : ''
  } else {
    if (value[col.key]) {
      let en: Enum
      for (const e of enums) {
        if (e.key === col.key) {
          en = e
          break
        }
      }
      if (en) {
        let found = false
        for (const v of en.values) {
          if (v.value === value[col.key]) {
            val = v.name
            found = true
            break
          }
        }
        if (!found) {
          messageError = `O valor do(a) ${col.name} tem que ser algum da lista disponível.`
        }
      } else {
        val = value[col.key]
      }
    }
  }
  return (
    <>
      {messageError && (
        <TableRow>
          <FiAlertCircle color={theme.colors.danger} />
          <span>
            <small>{messageError}</small>
          </span>
        </TableRow>
      )}
      {val}
    </>
  )
}

export const ImportStep: React.FC<Props> = ({
  columns,
  sendURL,
  extraParams,
  enums,
  title,
  file,
  createSchema,
  onNext,
  onPrevious
}) => {
  const [listToSend, setListToSend] = useState([])
  const [errorCount, setErrorCount] = useState(0)

  const [nextDisabled, setNextDisabled] = useState(true)
  const [previousDisabled, setPreviousDisabled] = useState(true)

  const [start, setStart] = useState(false)

  const [status, setStatus] = useState<{
    percentage: number
    message: string
    type: 'loading' | 'error' | 'done'
    info?: string
  }>({
    percentage: 0,
    message: 'Iniciando...',
    type: 'loading'
  })

  const [errors, setErrors] = useState({})

  const sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  const getObject = (position: number, list: any[]) => {
    if (list.length > position) return list[position]
    return null
  }

  const handleSend = useCallback(
    async (item: any, current: number, total: number, errorCount: number) => {
      let success = true
      if (enums)
        enums.forEach(e => {
          const value = item[e.key]
          let hasValue = false
          if (value) {
            for (const v of e.values) {
              hasValue = v.name.toUpperCase() === value.toUpperCase()
              if (hasValue) {
                item[e.key] = v.value
                break
              }
            }
          }
          success = hasValue
          if (!success) {
            item.message = 'O valor do(a) ' + e.name + ' não está correto.'
            item.status = 'error'
          }
        })
      if (success) {
        try {
          if (createSchema)
            await createSchema(item).validate(item, {
              abortEarly: false
            })
          const response = await api.post(sendURL, item)
          item.status = 'ok'
          item.message = 'Cadastrado com sucesso.'
          success = true
        } catch (e) {
          if (e instanceof Yup.ValidationError) {
            const errors = getValidationErrors(e)
            item.message = 'Ocorreu um erro com esse registro'
            setErrors(errors)
          } else {
            if (typeof e === 'string') {
              item.message = e
            } else {
              item.message = 'Erro desconhecido'
            }
          }
          console.error(e)
          item.status = 'error'
          success = false
        }
      }
      setStatus({
        percentage: ((current / total) * 100) | 0,
        message: 'Importando...',
        type: 'loading',
        info: `${current}/${total} lidos | ${errorCount} erros`
      })
      return success
    },
    [createSchema, enums, sendURL]
  )

  const handleSheetValue = useCallback(
    (list: any[], key: string, sheet: any, total: number, current: number) => {
      let column
      let position = 0
      try {
        position = parseInt(key.substr(1))
      } catch (error) {}

      if (position > 1) {
        try {
          column = key.substr(0, 1)
          const columnKey = columns[column_value_enum[column]].key
          let obj = getObject(position - 2, list)
          if (!obj) {
            obj = { status: 'not-send' }
            list.push(obj)
          }
          if (columns[column_value_enum[column]].type === 'date') {
            const dateParts = sheet[key].w.split('/')
            obj[columnKey] = new Date(
              +(dateParts[2].length === 2 ? '20' + dateParts[2] : dateParts[2]),
              dateParts[1] - 1,
              +dateParts[0]
            )
          } else {
            if (
              sheet[key].v &&
              columns[column_value_enum[column]].type === 'cpf'
            ) {
              console.log(1)

              obj[columnKey] = (sheet[key].v + '').replace(/\D/g, '')
            } else if (
              sheet[key].v &&
              columns[column_value_enum[column]].type === 'phone'
            ) {
              obj[columnKey] = formatPhone(
                (sheet[key].v + '').replace(/\D/g, '')
              )
            } else {
              obj[columnKey] = sheet[key].v
            }
          }
        } catch (error) {}
      }
      setStatus({
        percentage: ((current / total) * 100) | 0,
        message: 'Lendo arquivo...',
        type: 'loading',
        info: `${current}/${total} cedulas lidas`
      })
    },
    [columns]
  )

  const handleReadFile = useCallback(async () => {
    try {
      setStart(true)
      setStatus({ percentage: 0, message: 'Lendo arquivo...', type: 'loading' })
      const workbook = XLSX.read(file.file, { type: 'base64' })
      const sheetname = workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetname]
      let total = Object.keys(sheet).length
      let current = 0
      const list = []
      for (const key of Object.keys(sheet)) {
        handleSheetValue(list, key, sheet, total, current)
        current++
        await sleep(10)
      }

      for (const item of [...list]) {
        let ignore = true
        for (const key of Object.keys(item)) {
          if (item[key] && key !== 'status') {
            ignore = false
            break
          }
        }

        if (ignore) {
          list.splice(list.indexOf(item), 1)
        } else {
          if (extraParams)
            extraParams.forEach(param => {
              item[param.name] = param.value
            })
        }
      }

      setListToSend([...list])
      total = list.length
      current = 0
      let error = 0
      for (const item of [...list]) {
        const success = await handleSend(item, current, total, error)
        current++
        if (!success) error++
        await sleep(10)
      }
      setErrorCount(error)
      setListToSend([...list])
      setStatus({
        percentage: 100,
        message: 'Importação completa',
        type: 'done',
        info: `${total - error} importados | ${error} erros`
      })
      setNextDisabled(false)
      setPreviousDisabled(false)
    } catch (error) {
      console.error(error)

      setNextDisabled(false)
      setPreviousDisabled(false)
      setStatus({
        percentage: 100,
        message: 'Erro ao ler o arquivo',
        type: 'error'
      })
    }
  }, [extraParams, file.file, handleSend, handleSheetValue])

  if (!start) handleReadFile().then()
  return (
    <>
      <CardHeader>
        <Button
          disabled={nextDisabled}
          ghost
          color="secondary"
          size="default"
          type="button"
          onClick={onPrevious}
          inline
        >
          <FiChevronLeft size={20} />
          <span>Voltar</span>
        </Button>
        <Button
          disabled={previousDisabled}
          color={'primary'}
          size="default"
          type="button"
          onClick={onNext}
          inline
        >
          <FiCheck size={20} /> <span>Retornar</span>
        </Button>
      </CardHeader>
      <Section>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '10px'
          }}
        >
          {status.type === 'loading' && <Spinner size={70} />}
          {status.type === 'error' && (
            <FiAlertCircle color={theme.colors.danger} size={70} />
          )}
          {status.type === 'done' && (
            <FiCheckCircle color={theme.colors.success} size={70} />
          )}
        </div>

        <h2
          style={{
            textAlign: 'center'
          }}
        >
          {status.message}
        </h2>
      </Section>
      <Section>
        <ProgressBar width={status.percentage} />
        <Info>
          <div className="small">{status.info}</div>
          {errorCount > 0 && status.type !== 'loading' && (
            <Alert type="danger" card={true}>
              Houve <b>{errorCount} erro(s)</b> na importação. Verifique os
              registros importados para mais informações.
            </Alert>
          )}
        </Info>
      </Section>
      {listToSend.length > 0 && (
        <Section style={{ paddingBottom: '20px' }}>
          <Accordion
            title={
              status.type === 'loading'
                ? `Registros para Importação`
                : 'Registros Importados'
            }
          >
            <Table>
              <thead>
                <tr>
                  {columns?.map((col, index) => (
                    <td key={index}>{col.name}</td>
                  ))}
                  <td />
                </tr>
              </thead>
              <tbody>
                {listToSend.map((value, index) => (
                  <tr
                    style={{
                      color:
                        value.status === 'error'
                          ? theme.colors.danger
                          : theme.colors.darkShade
                    }}
                    key={index}
                  >
                    {columns.map((col, index1) => (
                      <td key={index1}>
                        <ColumnValueResponse
                          errors={errors}
                          col={col}
                          enums={enums}
                          value={value}
                        />
                      </td>
                    ))}
                    <td>
                      <span>
                        <Tooltip title={value.message}>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'center'
                            }}
                          >
                            {value.status === 'ok' && (
                              <FiCheckCircle
                                color={theme.colors.success}
                                size={20}
                              />
                            )}
                            {value.status === 'not-send' && (
                              <FiSend
                                color={theme.colors.secondary}
                                size={20}
                              />
                            )}
                            {value.status === 'error' && (
                              <FiAlertCircle
                                color={theme.colors.danger}
                                size={20}
                              />
                            )}
                          </div>
                        </Tooltip>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Accordion>
        </Section>
      )}
    </>
  )
}
