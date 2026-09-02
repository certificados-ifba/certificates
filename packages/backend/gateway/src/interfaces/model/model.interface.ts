import { ITipoCertificado } from '../tipo-certificado/tipo-certificado.interface'
import { IActivity } from '../activity/activity.interface'

interface ILayout {
  orientation?: string
  padding: string
  horizontal_padding: number
  vertical_padding: number
  position: string
  horizontal_position: number
  vertical_position: number
}

export interface IPage {
  type: string
  text: string
  image: string
  layout: ILayout
}

export interface ICriterion {
  activity: IActivity
}

export interface IModel {
  id: string
  event: ITipoCertificado
  name: string
  pages: IPage[]
  criterions: ICriterion[]
  is_default: boolean
}
