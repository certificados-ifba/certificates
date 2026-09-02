import { Schema } from 'mongoose'

export const CriterionSchema = new Schema({
  activity: {
    type: Schema.Types.ObjectId,
    ref: 'Activity',
    required: [true, 'Activity can not be empty']
  }
})
