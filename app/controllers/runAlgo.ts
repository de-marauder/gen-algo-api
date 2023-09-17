import { Request, Response } from "express";
import ErrorBoundary from "../helpers/ErrorBoundary";
import { RunModel } from "../models/Run";
import { AlgoResult, runAlgo } from "../lib/runAlgo";
import { Config } from "../lib/types";
import { SMRGeneticsAlgorithm } from "../lib/Algorithm/SMR";

export const runAlgorithm = async (req: Request, res: Response) => ErrorBoundary({
  req, res, cb: async (req, res) => {

    // req.body = {
    //   "smrConfig": {
    //     "smrPopSize": 30,
    //     "smrGenSize": 50,
    //     "smrMovingAverage": 10,
    //     "smrMutationProbability": 20
    //   },
    //   "mbConfig": {
    //     "mbPopSize": 30,
    //     "mbGenSize": 30,
    //     "mbMovingAverage": 10,
    //     "mbMutationProbability": 10
    //   },
    //   "flareGasComposition": {
    //     "ch4": 100,
    //     "c2h6": 0,
    //     "c3h8": 0,
    //     "ic4": 0,
    //     "nc4": 0,
    //     "ic5": 0,
    //     "nc5": 0,
    //     "ic6": 0,
    //     "nc6": 0,
    //     "h2": 0,
    //     "n2": 0,
    //     "co2": 0
    //   },
    //   "standardPressure": 1.01325,
    //   "traitBoundaries": {
    //     "pressureLowerbound": 20,
    //     "pressureUpperbound": 30,
    //     "temperatureLowerbound": 600,
    //     "temperatureUpperbound": 1200,
    //     "steamCarbonRatioLowerbound": 2,
    //     "steamCarbonRatioUpperbound": 8
    //   }
    // }

    const config = req.body as Config;
    // run algorithm
    const data = await runAlgo(config);
    if (data.error) throw new Error(data.error.message);
    // build result
    const runResult = buildResult(data.run.result, config, data.run.timeTaken, {})
    const result = await RunModel.create(runResult)
    .catch((error: Error)=>{
      if (error) throw new Error(error.message)
    })
  return res.status(200).json({ 
        status: 'success',
        message: 'done',
        result
     });
  }
})

const buildResult = (data: SMRGeneticsAlgorithm, config: Config, timeTaken: string, user: Record<string, string>): AlgoResult => {

  const r: AlgoResult = {
    mbGenSize: config.mbConfig.mbGenSize,
    mbMovingAverage: config.mbConfig.mbMovingAverage,
    mbMutationProbability: config.mbConfig.mbMutationProbability,
    mbPopSize: config.mbConfig.mbPopSize,
    smrGenSize: config.smrConfig.smrGenSize,
    smrMovingAverage: config.smrConfig.smrMovingAverage,
    smrMutationProbability: config.smrConfig.smrMutationProbability,
    smrPopSize: config.smrConfig.smrPopSize,
    pressureLowerbound: config.traitBoundaries.pressureLowerbound,
    pressureUpperbound: config.traitBoundaries.pressureUpperbound,
    temperatureLowerbound: config.traitBoundaries.temperatureLowerbound,
    temperatureUpperbound: config.traitBoundaries.temperatureUpperbound,
    steamCarbonRatioLowerbound: config.traitBoundaries.steamCarbonRatioLowerbound,
    steamCarbonRatioUpperbound: config.traitBoundaries.steamCarbonRatioUpperbound,
    standardPressure: config.standardPressure,
    ch4: config.flareGasComposition.ch4,
    c2h6: config.flareGasComposition.c2h6,
    c3h8: config.flareGasComposition.c3h8,
    ic4: config.flareGasComposition.ic4,
    nc4: config.flareGasComposition.nc4,
    ic5: config.flareGasComposition.ic5,
    nc5: config.flareGasComposition.nc5,
    ic6: config.flareGasComposition.ic6,
    nc6: config.flareGasComposition.nc6,
    co2: config.flareGasComposition.co2,
    h2: config.flareGasComposition.h2,
    n2: config.flareGasComposition.n2,
    outputCH4: data.population.population[0].a,
    outputCO: data.population.population[0].b,
    outputCO2: data.population.population[0].y,
    outputH2: data.population.population[0].fitness,
    outputH2O: data.population.population[0].h,
    pressure: data.population.population[0].traits.pressure,
    temperature: data.population.population[0].traits.temperature,
    steamToCarbonRatio: data.population.population[0].traits.steamCarbonRatio,
    numberOfGenerationsRan: data.generations.length,
    stopCondition: data.stoppedBy,
    timeTaken,
  };

  return r
}