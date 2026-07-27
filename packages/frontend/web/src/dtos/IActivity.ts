import { ITipoCertificado } from './ITipoCertificado'
import { IGeneric } from './IGeneric'

export interface IActivity {
  id: string
  name: string
  type: IGeneric
  workload: string
  start_date: string
  end_date: string
  event: ITipoCertificado
}
