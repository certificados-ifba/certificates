import { ITipoCertificado } from './tipo-certificado.interface'

export interface IServiceTipoCertificadoPublishByIdResponse {
    status: number
    message: string
    event: ITipoCertificado | null
    errors: { [key: string]: any } | null
}
