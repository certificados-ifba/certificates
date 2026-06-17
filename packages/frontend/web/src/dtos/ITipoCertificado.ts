import { IUser } from './IUser'

export interface ITipoCertificado {
  id: string
  status: 'DRAFT' | 'PUBLISHED' | 'REVIEW'
  tipo: string
  name: string
  local: string
  initials: string
  year: string
  edition: string
  start_date: any
  end_date: any
  user: IUser
}

export const statusTipoCertificado = {
  DRAFT: {
    text: 'Rascunho',
    color: 'medium'
  },
  PUBLISHED: {
    text: 'Publicado',
    color: 'success'
  },
  REVIEW: {
    text: 'Em revisão',
    color: 'warning'
  }
}
