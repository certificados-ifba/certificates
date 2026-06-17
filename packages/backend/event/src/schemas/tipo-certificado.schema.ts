import * as mongoose from 'mongoose'

function transformValue(doc, ret: { [key: string]: any }) {
  delete ret._id
  ret.start_date = ret.start_date.toISOString().substr(0, 10)
  ret.end_date = ret.end_date.toISOString().substr(0, 10)
}

export const TipoCertificadoSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User can not be empty']
    },
    name: {
      type: String,
      required: [true, 'Name can not be empty']
    },
    local: {
      type: String,
      required: [true, 'Local can not be empty']
    },
    initials: String,
    year: {
      type: String,
      required: [true, 'Year can not be empty']
    },
    edition: {
      type: String,
      required: [true, 'Edition can not be empty']
    },
    start_date: {
      type: Date,
      required: [true, 'Start date can not be empty']
    },
    end_date: {
      type: Date,
      required: [true, 'End date can not be empty']
    },
    tipo: {
      type: String,
      required: [true, 'Tipo can not be empty']
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'REVIEW'],
      default: 'DRAFT'
    }
  },
  {
    collection: 'tipos_certificado',
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

// TipoCertificadoSchema.pre('validate', function (next) {
//   const self = this as ITipoCertificado

//   if (this.isModified('user_id') && self.created_at) {
//     this.invalidate('user_id', 'The field value can not be updated')
//   }
//   next()
// })
