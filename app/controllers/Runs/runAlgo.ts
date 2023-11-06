import { RunModel } from "../../models/Run";
import { runAlgo } from "../../lib/runAlgo";
import { AlgoResult, Config } from "../../lib/Types/algo";
import { SMRGeneticsAlgorithm } from "../../lib/Algorithm/SMR";
import Trail from "../../services/Logger";

export const runAlgorithm = async (configId: string, payload: Config, userid: string) => {
  try {

    const config = { ...payload } as Config;
    // run algorithm
    const data = await runAlgo(config);
    if (data.error) return { error: data.error }
    // build result
    const runResult = buildResult(data.run.result, configId, data.run.timeTaken, userid)
    const result = await (await RunModel.create(runResult))
      .populate('config')
      .catch((error: Error) => {
        if (error) throw new Error(error.message)
      })
    return { run: result }
  } catch (error) {
    Trail.logError({
      message: (error as Error).message || 'Error while creating run',
      module: __filename,
      metadata: error
    })
    return { error: { message: 'Error while creating run' } }
  }
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
    error: data.population.population[0].error,
    timeTaken,
    userid
  };

  return r
}