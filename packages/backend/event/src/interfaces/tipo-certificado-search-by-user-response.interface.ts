import { ITipoCertificado } from './tipo-certificado.interface'

export interface ITipoCertificadoSearchByUserResponse {
  status: number
  message: string
  events: ITipoCertificado[]
}
