import { Schema, model } from 'mongoose';

const RunSchema = new Schema(
  {
    config: {
      type: Schema.Types.ObjectId,
      required: true
    },
    outputCH4: {
      required: true,
      type: Number
    },
    outputCO: {
      required: true,
      type: Number
    },
    outputCO2: {
      required: true,
      type: Number
    },
    outputH2: {
      required: true,
      type: Number
    },
    outputH2O: {
      required: true,
      type: Number
    },
    pressure: {
      required: true,
      type: Number
    },
    temperature: {
      required: true,
      type: Number
    },
    steamToCarbonRatio: {
      required: true,
      type: Number
    },
    numberOfGenerationsRan: {
      required: true,
      type: Number
    },
    stopCondition: String,
    timeTaken: String,
    error: Number,
    userid: Schema.Types.ObjectId
  },
  {
    timestamps: true
  }
)

export const RunModel = model('RunModel', RunSchema, 'RunModel')
