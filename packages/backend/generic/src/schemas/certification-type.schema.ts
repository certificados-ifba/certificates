import * as mongoose from 'mongoose'

function transformValue(doc, ret: { [key: string]: any }) {
  delete ret._id
}

export const CertificationTypeSchema = new mongoose.Schema(
  {
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
    collection: 'certification_types',
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
