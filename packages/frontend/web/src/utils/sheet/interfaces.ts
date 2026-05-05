import { Column, DataValidation } from 'exceljs'

export interface IData {
  column: Partial<Column>
  validation?: DataValidation
}

export interface IStatus {
  percentage: number
  message: string
  type: 'waiting' | 'loading' | 'error' | 'done'
  info?: string
  errors: number
  successes: number
}

export interface ReturnData<T = any> {
  status: string
  message: string
  data: T
  errors?: string[]
  fieldErrors?: { [key: string]: string }
}

export interface IWorksheet {
  name: string
  rows: string[][]
}

export interface IFormula {
  range: string
  formula: string
}
