import { api } from '@services'
import { getValidationErrors, IErrors } from '@utils'
import { getErrorMessage } from '@utils/getErrorMessage'
import { formatCpf, formatDate, formatPhone } from '@utils/formatters'
import { CellValue, Row, Workbook } from 'exceljs'
import { SetStateAction } from 'react'
import { AnySchema, ValidationError } from 'yup'

import {
  CELL_STYLE,
  HEADER_STYLE,
  MESSAGE_ERROR,
  QTD_ROWS,
  SHEET_NAME,
  SHEET_PASSWORD,
  TITLE,
  USER_NAME,
  WORKBOOK_VIEW,
  WORKSHEET_VIEW
} from './constants'
import { DataError } from './error'
import { IData, IStatus, IWorksheet, ReturnData, IFormula } from './interfaces'
export type { IData as IDataSheet, IStatus, ReturnData, IWorksheet, IFormula }

export const downloadInconsistencies = async (
  registers: ReturnData[],
  dataSheet: IData[],
  filename: string
): Promise<void> => {
  const errors = registers.filter(r => r.status === 'error')
  const workbook = await createSheet(dataSheet)
  const worksheet = workbook.getWorksheet(SHEET_NAME)
  errors.forEach(({ data }) => {
    worksheet.addRow(dataSheet.map(({ column }) => data[column.key]))
  })
  await downloadSheet(workbook, filename)
}

export { SHEET_NAME, QTD_ROWS }

export const createSheet = async (
  data: IData[],
  worksheets?: IWorksheet[],
  formulas?: IFormula[]
): Promise<Workbook> => {
  const workbook = new Workbook()

  workbook.creator = USER_NAME
  workbook.lastModifiedBy = USER_NAME
  workbook.subject = TITLE
  workbook.title = TITLE
  workbook.created = new Date()
  workbook.modified = new Date()
  workbook.lastPrinted = new Date()
  workbook.properties.date1904 = false
  workbook.views = [WORKBOOK_VIEW]

  const worksheet = workbook.addWorksheet(SHEET_NAME, {
    views: [WORKSHEET_VIEW]
  })

  worksheet.columns = data.map(({ column }) => column)
  worksheet.getRow(1).eachCell(cell => (cell.style = HEADER_STYLE))

  const obj = Object.create(null)
  data.forEach(({ column }) => {
    Object.assign(obj, { [String(column.key)]: String(column.key) })
  })

  worksheet.addRow(obj).hidden = true

  if (formulas)
    formulas.forEach(({ range, formula }) =>
      worksheet.fillFormula(range, formula)
    )

  await worksheet.protect(SHEET_PASSWORD, { selectLockedCells: false })

  for (let rowNumber = 3; rowNumber <= QTD_ROWS; rowNumber++) {
    for (let cellNumber = 1; cellNumber <= data.length; cellNumber++) {
      const cell = worksheet.getRow(rowNumber).getCell(cellNumber)
      cell.style = { ...cell.style, ...CELL_STYLE }
      if (data[cellNumber - 1]?.validation)
        cell.dataValidation = {
          ...data[cellNumber - 1].validation,
          showErrorMessage: true,
          showInputMessage: true,
          errorStyle: 'error',
          errorTitle: MESSAGE_ERROR,
          allowBlank: false,
          promptTitle: String(data[cellNumber - 1].column?.header)
        }
    }
  }

  if (worksheets) {
    worksheets.forEach(async ({ name, rows }) => {
      const ws = workbook.addWorksheet(name)
      ws.addRows(rows)
      ws.state = 'veryHidden'
      await ws.protect(SHEET_PASSWORD, { selectLockedCells: false })
    })
  }

  return workbook
}

export const downloadSheet = async (
  workbook: Workbook,
  filename: string
): Promise<void> => {
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  const blobUrl = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = blobUrl
  link.setAttribute('download', `${filename}-${Date.now()}.xlsx`)
  document.body.appendChild(link)
  link.click()
  link.parentNode.removeChild(link)
}

export const readSheet = (file: File): Promise<Workbook> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    const workbook = new Workbook()

    reader.onload = async (evt: any) => {
      const buffer = evt.target.result
      try {
        await workbook.xlsx.load(buffer)
        resolve(workbook)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = error => reject(error)
    reader.readAsArrayBuffer(file)
  })

const getValue = (data: CellValue): string | boolean => {
  if (data instanceof Date) return formatDate(data, true, true, true)
  if (typeof data === 'number') return String(data)
  if (typeof data === 'boolean') return data
  if (typeof data === 'string') {
    const isBoolean = !(
      data?.toLowerCase() !== 'não' && data?.toLowerCase() !== 'sim'
    )
    return isBoolean ? data?.toLowerCase() === 'sim' : data
  }
  if ('error' in data) return data.error
  if ('text' in data) return data.text
  if ('richText' in data)
    return data.richText.flatMap(({ text }) => text).join(' ')
  if ('sharedFormula' in data || 'formula' in data) {
    const result = data.result
    if (result instanceof Date) return formatDate(result, true, true, true)
    if (typeof result === 'number') return String(result)
    if (typeof result === 'string') {
      const isBoolean = !(
        result?.toLowerCase() !== 'não' && result?.toLowerCase() !== 'sim'
      )
      return isBoolean ? result?.toLowerCase() === 'sim' : result
    }
    if (typeof result === 'boolean') return result
    if ('error' in result) return result.error.error
  }
}

const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const getRow = (
  row: Row,
  cols: CellValue[] | { [key: string]: CellValue },
  schema: AnySchema
): Promise<ReturnData> =>
  new Promise((resolve, reject) => {
    const data = Object.create(null)
    row.eachCell((cell, key) => {
      const col = cols[key]
      let value = getValue(cell.value)
      if (col === 'cpf') value = formatCpf(String(value))
      if (col === 'phone') value = formatPhone(String(value))
      Object.assign(data, { [col]: getValue(value) })
    })

    // Se não tiver data de nascimento, adiciona data padrão
    if (!data.dob) {
      data.dob = '2017-12-23'
    }

    sleep(row.number).then(() => {
      schema
        .validate(data, {
          abortEarly: false
        })
        .then(() =>
          resolve({
            status: 'not-send',
            message: 'Não foi enviado',
            data
          })
        )
        .catch(err => {
          let message = 'Erro desconhecido'
          let fieldErrors: IErrors = {}
          if (err instanceof ValidationError) {
            fieldErrors = getValidationErrors(err)
            message = Object.values(fieldErrors).join('; ')
          }
          reject(
            new DataError({
              status: 'error',
              message,
              data,
              errors: Object.keys(fieldErrors),
              fieldErrors
            })
          )
        })
    })
  })

const loadingStatus = (
  current: number,
  max: number,
  changeStatus: (status: SetStateAction<IStatus>) => void
) =>
  changeStatus(status => ({
    ...status,
    percentage: Math.floor((current / max) * 100),
    info: `${current}/${max} linha(s) lida(s) | ${status.errors} erros`
  }))

export const getData = (
  workbook: Workbook,
  changeStatus: (status: SetStateAction<IStatus>) => void,
  schema: AnySchema
): Promise<ReturnData[]> => {
  const worksheet = workbook.getWorksheet(SHEET_NAME)
  const rows = worksheet.getRows(3, QTD_ROWS).filter(row => row.hasValues)
  const cols = worksheet.getRow(2).values
  const promises = rows
    .filter(({ values }) => {
      let length = 0
      if (Array.isArray(values)) length = values.filter(value => !!value).length
      return length > 2
    })
    .map((row, current) =>
      getRow(row, cols, schema)
        .finally(() => loadingStatus(current + 1, rows.length, changeStatus))
        .then((res: ReturnData) => res)
        .catch(err => {
          console.error(err)
          changeStatus(({ errors, ...rest }) => ({
            ...rest,
            errors: errors + 1
          }))
          if (err instanceof DataError) return err.data
        })
    )
  return Promise.all(promises).then(results =>
    results.filter((r): r is ReturnData => r !== undefined)
  )
}

export const sendData = (
  registers: ReturnData[],
  url: string,
  changeStatus: (status: SetStateAction<IStatus>) => void
): Promise<ReturnData[]> => {
  const parseRequestErrorMessage = (error: any): string => {
    if (typeof error === 'string') return error
    const code = error?.response?.data?.message || error?.message
    const details = error?.response?.data?.errors
    return getErrorMessage(code, details)
  }

  const total = registers.length
  const promises = registers.map(async (register, current) => {
    const { status, data } = register
    changeStatus(status => ({
      ...status,
      percentage: Math.floor(((current + 1) / total) * 100) | 0,
      message: 'Importando...',
      info: `${current + 1}/${total} enviado(s) | ${status.errors} erros`
    }))
    if (status !== 'not-send') return register
    try {
      if (data?.delete) delete data.delete
      await api.post(url, data)
      register.status = 'ok'
      register.message = 'Cadastrado com sucesso'
      changeStatus(({ successes, ...rest }) => ({
        ...rest,
        successes: successes + 1
      }))
    } catch (err) {
      changeStatus(({ errors, ...rest }) => ({ ...rest, errors: errors + 1 }))
      register.status = 'error'
      register.message = parseRequestErrorMessage(err)
    }
    return register
  })
  return Promise.all(promises)
}
