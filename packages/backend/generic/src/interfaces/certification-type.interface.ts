import { Document } from 'mongoose'

export interface ICertificationType extends Document {
  id?: string
  name: string
  icon?: string
  created_at: number
  updated_at: number
}
