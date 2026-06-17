import { Document } from 'mongoose'

export interface ITipoCertificado extends Document {
  user: any
  name: string
  local: string
  initials: string
  year: string
  edition: string
  start_date: Date
  end_date: Date
  created_at: number
  updated_at: number
}
