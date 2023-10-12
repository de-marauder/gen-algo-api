import { Schema, model } from 'mongoose';
import { ErrorResponse } from '../helpers/ErrorBoundarySync';
import { TypeRun } from '../lib/Types/runs';

const RunSchema = new Schema<TypeRun>(
  {
    no: Number,
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
    userid: String
  },
  {
    timestamps: true
  }
)

RunSchema.pre('save', async function () {
  console.log('running runs presave hook')
  if (!this.no) {
    const length = await RunModel.countDocuments({ config: this.config, userid: this.userid });
    this.no = length;
  }
})

export const RunModel = model('RunModel', RunSchema, 'RunModel')
