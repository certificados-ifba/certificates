import { IParticipant } from './IParticipant'

// Componente para exibir informações do certificado
interface ICertificate {
  id?: string
  activity?: string
  function?: string
  participant?: IParticipant
  event?: string
  workload?: number
  start_date?: Date
  end_date?: Date
  authorship_order?: string
  additional_field?: string
  name?: string
  front?: {
    img: string
    text: string
  }
  verse?: {
    img: string
    text: string
  }
  roles?: Array<{
    number: number
    activity: { name: string; id: string }
    function: { name: string; id: string }
  }>
  is_default?: boolean
  edit?: boolean
  confirmed?: boolean
}

export interface IRole {
  number: number
  activity: { name: string; id: string }
  function: { name: string; id: string }
}

export type { ICertificate }
export default ICertificate

export interface ILayout {
  padding: string
  horizontal_padding: string
  vertical_padding: string
  position: string
  horizontal_position: string
  vertical_position: string
}

interface IPage {
  type: 'frente' | 'verso'
  text: string
  image: string
  layout: ILayout
}

interface ICriterion {
  type_activity_id: string
  function_id: string
}

export type { ICriterion }

export interface IModelCertificate {
  name: string
  pages: IPage[]
  criterions: ICriterion[]
  is_default?: boolean
}

// export interface ILayout {
//   img: string
//   text: string
// }

// export interface IRole {
//   number: number
//   activity: { name: string; id: string }
//   function: { name: string; id: string }
// }

// export interface ICertificate {
//   name: string
//   front: ILayout
//   verse?: ILayout
//   roles: IRole[]
//   edit?: boolean
//   id: string
//   confirmed?: boolean
// }
