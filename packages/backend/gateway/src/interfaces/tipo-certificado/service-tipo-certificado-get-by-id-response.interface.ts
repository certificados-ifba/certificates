import { ITipoCertificado } from './tipo-certificado.interface'

export interface IServiceTipoCertificadoGetByIdResponse {
  status: number
  message: string
  data: {
    event: ITipoCertificado | null
  }
}
