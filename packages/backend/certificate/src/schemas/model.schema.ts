import * as mongoose from 'mongoose'

import { CriterionSchema } from './criterion.schema'
import { PageSchema } from './page.schema'

function transformValue(doc, ret: { [key: string]: any }) {
  delete ret._id
}

export const ModelSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Event can not be empty']
    },
    name: {
      type: String,
      required: [true, 'Name can not be empty']
    },
    pages: {
      type: [PageSchema],
      required: [true, 'Pages can not be empty']
    },
    criterions: {
      type: [CriterionSchema],
      required: false
    },
    is_default: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    },
    toObject: {
      virtuals: true,
      versionKey: false,
      transform: transformValue
    },
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: transformValue
    }
  }
)
