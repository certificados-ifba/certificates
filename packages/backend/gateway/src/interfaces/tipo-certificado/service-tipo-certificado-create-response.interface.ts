import { ITipoCertificado } from './tipo-certificado.interface'

export interface IServiceTipoCertificadoCreateResponse {
  status: number
  message: string
  event: ITipoCertificado | null
  errors: { [key: string]: any }
}
