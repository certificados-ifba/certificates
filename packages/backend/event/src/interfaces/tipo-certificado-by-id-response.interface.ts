import { ITipoCertificado } from './tipo-certificado.interface'

export interface ITipoCertificadoByIdResponse {
  status: number
  message: string
  data: {
    event: ITipoCertificado | null
  }
}
