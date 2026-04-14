import { IEvent } from '../event/event.interface'
import { IGeneric } from '../generic/generic.interface'

interface ILayout {
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
  function: IGeneric
  type_activity: IGeneric
}

export interface IModel {
  id: string
  event: IEvent
  name: string
  pages: IPage[]
  criterions: ICriterion[]
  is_default: boolean
}
