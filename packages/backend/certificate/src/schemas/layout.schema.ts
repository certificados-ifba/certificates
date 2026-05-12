import { Schema } from 'mongoose'

export const AlignSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name can not be empty']
  },
  value: {
    type: Number,
    required: [true, 'Value can not be empty']
  }
})

export const SidesSchema = new Schema({
  top: {
    type: String,
    required: [true, 'Top can not be empty']
  },
  right: {
    type: Number,
    required: [true, 'Right can not be empty']
  },
  bottom: {
    type: Number,
    required: [true, 'Bottom can not be empty']
  },
  left: {
    type: String,
    required: [true, 'Left can not be empty']
  }
})

export const LayoutSchema = new Schema({
  orientation: {
    type: String,
    required: false,
    default: 'horizontal'
  },
  padding: {
    type: SidesSchema,
    required: [true, 'Padding can not be empty']
  },
  vertical: {
    type: AlignSchema,
    required: [true, 'Horizontal can not be empty']
  },
  horizontal: {
    type: AlignSchema,
    required: [true, 'Vertical can not be empty']
  }
})
