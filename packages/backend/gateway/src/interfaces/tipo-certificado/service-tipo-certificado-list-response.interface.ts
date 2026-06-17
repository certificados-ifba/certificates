import { ITipoCertificado } from './tipo-certificado.interface'

export interface IServiceTipoCertificadoListResponse {
  status: number
  message: string
  data: {
    events: ITipoCertificado[]
    totalPages: number
    totalCount: number
  }
}
