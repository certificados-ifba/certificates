import { IModel } from './model.interface'

export interface IModelUpdateResponse {
  status: number
  message: string
  model: IModel | null
  errors: { [key: string]: any } | null
}
