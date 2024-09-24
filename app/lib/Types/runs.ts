import { Types } from "mongoose";

export interface TypeRun {
  no: number;
  config: Types.ObjectId;
  outputCH4: number;
  outputCO: number;
  outputCO2: number;
  outputH2: number;
  outputH2O: number;
  pressure: number;
  temperature: number;
  steamToCarbonRatio: number;
  numberOfGenerationsRan: number;
  generations: {
    error: number,
    hydrogen: number,
    methane: number,
    CO: number,
    CO2: number,
  }[],
  stopCondition: string;
  timeTaken: string;
  error: number,
  userid: string
}