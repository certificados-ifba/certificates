import { ITipoCertificado } from '../tipo-certificado/tipo-certificado.interface'
import { IGeneric } from '../generic/generic.interface'

export interface IActivity {
  id?: string
  name: string
  workload: number
  start_date: Date
  end_date: Date
  event: ITipoCertificado
  type: IGeneric
}
