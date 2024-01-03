import { isMainThread, parentPort } from "worker_threads";

import { pr } from "../../helpers/promise";
import { runAlgorithm } from "../../controllers/Runs/runAlgo";
import Trail from "../Logger";
import { db } from "../../config/db";
import { TypeUser } from "../../lib/Types/user";
import { Config } from "../../lib/Types/algo";
import { loadModels } from "../../config/db";


console.log("Outside B4 Inside Worker thread")
try {
  console.log("B4 Inside Worker thread")
  if (!isMainThread && parentPort) {
    // loadModels();
    // console.log(parentPort)
    // console.log("Models from inside worker: ", db)
    // Code inside here runs in the worker thread
    console.log("Inside Worker thread")
    // Listen for messages from the main thread
    parentPort.on('message', (message: string) => {
      // Perform the long-running task
      // console.log('Worker received message: ', message)
      const { configId, config, user } = JSON.parse(message) as {
        configId: string;
        config: Config;
        user: Required<TypeUser>
      }
      pr().then(() => {
        console.log("isMainThread: ", isMainThread)
        // console.log('worker db', db)
        return runAlgorithm(configId, config, user._id, db)
      })
        .then(({ run, error }: any) => {
          // Once the task is done, send a message back to the main thread
          const m = JSON.stringify({
            message: 'Task completed',
            run, error
          })
          parentPort ? parentPort.postMessage(m) : console.log('parentPort not available')
        })
        .catch((error: Error) => {
          Trail.logError({
            module: __filename,
            message: error.message,
            type: 'RUN_ERROR',
            metadata: error,
            db
          })
        });
    });
  }
} catch (error) {
  Trail.logError({
    module: __filename,
    message: (error as Error).message,
    type: 'RUN_ERROR',
    metadata: error,
    db
  })
}
