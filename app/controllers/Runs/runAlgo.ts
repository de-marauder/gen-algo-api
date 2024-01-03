import { RunModel } from "../../models/Run";
import { runAlgo } from "../../lib/runAlgo";
import { AlgoResult, Config } from "../../lib/Types/algo";
import { SMRGeneticsAlgorithm } from "../../lib/Algorithm/SMR";
import Trail from "../../services/Logger";
import { TypeRun } from "../../lib/Types/runs";
import { Connection, Document } from "mongoose";
import { Types } from "mongoose";

export type Result = Omit<Document<unknown, {}, TypeRun> & TypeRun & {
  _id: Types.ObjectId;
}, never>

export const runAlgorithm = async (configId: string, payload: Config, userid: string, db: Connection): Promise<
  { run: Result, error?: null } |
  { error: { message: string }, run?: null }
> => {
  return new Promise((resolve, reject) => {
    try {
      const config = { ...payload } as Config;
      // run algorithm
      runAlgo(config).then((data) => {
        if (data.error) return { error: data.error }
        // build result
        const runResult = buildResult(data.run.result, configId, data.run.timeTaken, userid)
        db.models.RunModel.create(runResult).then((doc) => {
          doc.populate('config').then((result: Result) => {
            return resolve({ run: result })
          }).catch((error: Error) => {
            Trail.logError({
              message: (error as Error).message || 'Error while creating run',
              module: __filename,
              metadata: error,
              db: db
            })
            return reject({ error: { message: 'Error while creating run' } })
          })
        })
      });
    } catch (error) {
      Trail.logError({
        message: (error as Error).message || 'Error while creating run',
        module: __filename,
        metadata: error,
        db
      })
      return reject({ error: { message: 'Error while creating run' } })
    }
  })
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