import * as mongoose from 'mongoose'

function transformValue(doc, ret: { [key: string]: any }) {
  delete ret._id
}

export const GenericSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      lowercase: true,
      trim: true,
      required: [true, 'Type can not be empty']
    },
    name: {
      type: String,
      lowercase: true,
      trim: true,
      required: [true, 'Name can not be empty']
    },
    icon: {
      type: String,
      trim: true
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
