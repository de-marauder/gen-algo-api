import path from 'path'
import { Worker, isMainThread, parentPort } from 'worker_threads';
import { NextFunction, Request, Response } from "express";
import ErrorBoundary, { ErrorResponse } from "../../helpers/ErrorBoundary";
import { Result, runAlgorithm } from "./runAlgo";
import { ConfigModel } from "../../models/Config";
import { TypeUser } from "../../lib/Types/user";
import { sendRunNotif } from "../../helpers/Notifications";
import Trail from "../../services/Logger";

export const createRun = async (req: Request, res: Response, next: NextFunction) => ErrorBoundary({
  module: __filename,
  req, res, next,
  cb: async (req, res) => {
    const user = req.body._user as Required<TypeUser>

    const { config, error: e } = await buildPayload(req.body.configId);

    if (e) throw e
    res.status(200).json({
      status: 'success',
      message: 'Run started',
    });

    // Create a new worker thread for the long-running task
    const p = path.join(path.dirname(path.join(__dirname, '/..')), 'services', 'workers', 'run-algo.js')
    // console.log("worker path: ", p)
    const worker = new Worker(p);

    // Listen for messages from the worker thread
    worker.on('message', (message: string) => {
      // Handle the message received from the worker (e.g., task completion)
      const m = JSON.parse(message) as {
        message: string,
        run: Result, error: Error | ErrorResponse
      }
      // console.log(`Received message from worker: ${m}`);
      sendRunNotif(m.run, m.error, user)
      console.log('Algo run done')
      // You can perform any cleanup or other operations here
    });

    // Send data to the worker thread (if needed)
    const m = {
      configId: req.body.configId,
      config: config,
      user
    }
    worker.postMessage(JSON.stringify(m));
    console.log('Finished')
  }
})

const buildPayload = async (configId: string) => {
  try {
    const config = await ConfigModel.findById(configId);
    if (!config) return { error: new ErrorResponse({ code: 404, errorCode: 'CONFIG_NOT_FOUND', message: `The config with id ${configId} does not exist` }) }

    const build = {
      smrConfig: {
        smrPopSize: config.smrPopSize,
        smrGenSize: config.smrGenSize,
        smrMovingAverage: config.smrMovingAverage,
        smrMutationProbability: config.smrMutationProbability
      },
      mbConfig: {
        mbPopSize: config.mbPopSize,
        mbGenSize: config.mbGenSize,
        mbMovingAverage: config.mbMovingAverage,
        mbMutationProbability: config.mbMutationProbability
      },
      flareGasComposition: {
        ch4: config.ch4,
        c2h6: config.c2h6,
        c3h8: config.c3h8,
        ic4: config.ic4,
        nc4: config.nc4,
        ic5: config.ic5,
        nc5: config.nc5,
        ic6: config.ic6,
        nc6: config.nc6,
        h2: config.h2,
        n2: config.n2,
        co2: config.co2
      },
      standardPressure: config.standardPressure,
      traitBoundaries: {
        pressureLowerbound: config.pressureLowerbound,
        pressureUpperbound: config.pressureUpperbound,
        temperatureLowerbound: config.temperatureLowerbound,
        temperatureUpperbound: config.temperatureUpperbound,
        steamCarbonRatioLowerbound: config.steamCarbonRatioLowerbound,
        steamCarbonRatioUpperbound: config.steamCarbonRatioUpperbound
      }
    }

    return { config: build }
  } catch (error) {
    return { error: error as ErrorResponse | Error }
  }
}
