import { Types } from "mongoose";
import { TypeConfig } from "./Config";

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
  stopCondition: string;
  timeTaken: string;
  error: number,
  userid: string
}