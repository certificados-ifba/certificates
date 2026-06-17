import { ITipoCertificado } from './tipo-certificado.interface'

export interface ITipoCertificadoUpdateByIdResponse {
  status: number
  message: string
  event: ITipoCertificado | null
  errors: { [key: string]: any } | null
}
