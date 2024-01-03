import mongoose, { Schema, model } from 'mongoose';
import { ErrorResponse } from '../helpers/ErrorBoundary';
import { TypeRun } from '../lib/Types/runs';
import { db, waitForDB } from '../config/db';
import { pr } from '../helpers/promise';

const RunSchema = new Schema<TypeRun>(
  {
    no: Number,
    config: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'ConfigModel'
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
  // console.log("b4 pre savemodels: ", db.models)
  console.log('running runs presave hook')
  if (!this.no) {
    waitForDB(() => {
      db.models.RunModel.countDocuments({ config: this.config, userid: this.userid }).then((length) => {
        this.no = length;
        console.log("------------ Run saved --------------")
      });
    })
  }
})

export const RunModel = model('RunModel', RunSchema, 'RunModel')
