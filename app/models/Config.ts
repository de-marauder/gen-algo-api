import { Schema, model } from 'mongoose';
import { TypeConfig } from '../lib/Types/Config';

const ConfigSchema = new Schema<TypeConfig>(
  {
    mbGenSize: {
      required: true,
      type: Number
    },
    mbMovingAverage: {
      required: true,
      type: Number
    },
    mbMutationProbability: {
      required: true,
      type: Number
    },
    mbPopSize: {
      required: true,
      type: Number
    },
    smrGenSize: {
      required: true,
      type: Number
    },
    smrMovingAverage: {
      required: true,
      type: Number
    },
    smrMutationProbability: {
      required: true,
      type: Number
    },
    smrPopSize: {
      required: true,
      type: Number
    },
    pressureLowerbound: {
      required: true,
      type: Number
    },
    pressureUpperbound: {
      required: true,
      type: Number
    },
    temperatureLowerbound: {
      required: true,
      type: Number
    },
    temperatureUpperbound: {
      required: true,
      type: Number
    },
    steamCarbonRatioLowerbound: {
      required: true,
      type: Number
    },
    steamCarbonRatioUpperbound: {
      required: true,
      type: Number
    },
    standardPressure: {
      required: true,
      type: Number
    },
    ch4: {
      required: true,
      type: Number
    },
    c2h6: {
      required: true,
      type: Number
    },
    c3h8: {
      required: true,
      type: Number
    },
    ic4: {
      required: true,
      type: Number
    },
    nc4: {
      required: true,
      type: Number
    },
    ic5: {
      required: true,
      type: Number
    },
    nc5: {
      required: true,
      type: Number
    },
    ic6: {
      required: true,
      type: Number
    },
    nc6: {
      required: true,
      type: Number
    },
    co2: {
      required: true,
      type: Number
    },
    h2: {
      required: true,
      type: Number
    },
    n2: {
      required: true,
      type: Number
    },
    userid: Schema.Types.ObjectId
  },
  {
    timestamps: true
  }
)

export const ConfigModel = model('ConfigModel', ConfigSchema, 'ConfigModel')

