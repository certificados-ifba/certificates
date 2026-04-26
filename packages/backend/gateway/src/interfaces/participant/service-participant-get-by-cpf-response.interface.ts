import { IParticipant } from './participant.interface'

export interface IServiceParticipantGetByCpfResponse {
  status: number
  message: string
  data: {
    user: IParticipant | null
  }
}
