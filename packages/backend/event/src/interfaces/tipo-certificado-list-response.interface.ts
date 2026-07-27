import { ITipoCertificado } from './tipo-certificado.interface'

export interface DataResponse {
  events: ITipoCertificado[]
  totalPages: number
  totalCount: number
}

export interface ITipoCertificadoListResponse {
  status: number
  message: string
  data: DataResponse
}
