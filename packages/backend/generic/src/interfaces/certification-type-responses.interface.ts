import { ICertificationType } from './certification-type.interface'

export interface CertificationTypeDataResponse {
  certificationTypes: ICertificationType[]
  totalPages: number
  totalCount: number
}

export interface ICertificationTypeListResponse {
  status: number
  message: string
  data: CertificationTypeDataResponse
}

export interface ICertificationTypeByIdResponse {
  status: number
  message: string
  certificationType: ICertificationType | null
}

export interface ICertificationTypeCreateResponse {
  status: number
  message: string
  certificationType: ICertificationType | null
  errors: { [key: string]: any } | null
}

export interface ICertificationTypeUpdateResponse {
  status: number
  message: string
  certificationType: ICertificationType | null
  errors: { [key: string]: any } | null
}

export interface ICertificationTypeDeleteResponse {
  status: number
  message: string
  errors: { [key: string]: any } | null
}
