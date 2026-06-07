import * as mongoose from 'mongoose'

function transformValue(doc, ret: { [key: string]: any }) {
  delete ret._id
  ret.start_date = ret.start_date.toISOString().substr(0, 10)
  ret.end_date = ret.end_date.toISOString().substr(0, 10)
}

export const ActivitySchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event can not be empty']
    },
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Generic',
      required: [true, 'Type can not be empty']
    },
    name: {
      type: String,
      required: [true, 'Name can not be empty']
    },
    workload: {
      type: Number,
      required: [true, 'Workload can not be empty']
    },
    start_date: {
      type: Date,
      required: [true, 'Start date can not be empty']
    },
    end_date: {
      type: Date,
      required: [true, 'End date can not be empty']
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
