import { RunModel } from "../../models/Run";
import { AlgoResult, runAlgo } from "../../lib/runAlgo";
import { Config } from "../../lib/Types/algo";
import { SMRGeneticsAlgorithm } from "../../lib/Algorithm/SMR";

export const runAlgorithm = async (configId: string, payload: Config, userid: string) => {
  const config = { ...payload } as Config;
  // run algorithm
  const data = await runAlgo(config);
  if (data.error) return { error: data.error }
  // build result
  const runResult = buildResult(data.run.result, configId, data.run.timeTaken, userid)
  const result = await RunModel.create(runResult)
    .catch((error: Error) => {
      if (error) throw new Error(error.message)
    })
  return { run: result }

}

const buildResult = (data: SMRGeneticsAlgorithm, configId: string, timeTaken: string, userid: string): AlgoResult => {

  const r = {
    config: configId,
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
    userid
  };

  return r
}