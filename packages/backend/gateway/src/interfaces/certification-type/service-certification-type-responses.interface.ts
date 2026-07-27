import { IGeneric } from '../generic/generic.interface'

export interface IServiceCertificationTypeListResponse {
  status: number
  message: string
  data: {
    certificationTypes: IGeneric[]
    totalPages: number
    totalCount: number
  }
}

export interface IServiceCertificationTypeGetByIdResponse {
  status: number
  message: string
  certificationType: IGeneric | null
}

export interface IServiceCertificationTypeCreateResponse {
  status: number
  message: string
  certificationType: IGeneric | null
  errors: { [key: string]: any } | null
}

export interface IServiceCertificationTypeUpdateResponse {
  status: number
  message: string
  certificationType: IGeneric | null
  errors: { [key: string]: any } | null
}

export interface IServiceCertificationTypeDeleteResponse {
  status: number
  message: string
  errors: { [key: string]: any } | null
}
