import { IModel } from './model.interface'

export interface IServiceModelUpdateResponse {
  status: number
  message: string
  model: IModel | null
  errors: { [key: string]: any }
}
