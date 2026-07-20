import { IUser } from '../user/user.interface'

export interface ITipoCertificado {
  id?: string
  type: string
  name: string
  local: string
  initials: string
  year: string
  edition: string
  start_date: Date
  end_date: Date
  user: IUser
}
