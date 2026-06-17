import { ITipoCertificado } from './tipo-certificado.interface'

export interface IServiceTipoCertificadoSearchByUserIdResponse {
  status: number
  message: string
  events: ITipoCertificado[]
}
