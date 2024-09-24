import { isMainThread, parentPort } from "worker_threads";

import { pr } from "../../helpers/promise";
import { runAlgorithm } from "../../controllers/Runs/runAlgo";
import Trail from "../Logger";
import { db } from "../../config/db";
import { TypeUser } from "../../lib/Types/user";
import { Config } from "../../lib/Types/algo";


try {
  if (!isMainThread && parentPort) {
    // Code inside here runs in the worker thread
    console.log("Inside Worker thread")
    // Listen for messages from the main thread
    parentPort.on('message', (message: string) => {
      // Perform the long-running task
      const { configId, config, numberOfRuns, user } = JSON.parse(message) as {
        configId: string;
        config: Config;
        numberOfRuns: number;
        user: Required<TypeUser>
      }
      pr().then(async () => {
        const result = []
        console.log(`Will run ${numberOfRuns} jobs`)
        for (let i = 0; i < numberOfRuns; i++) {
          console.log(`Running job number ${i+1}`)
          const { run, error } = await runAlgorithm(configId, config, user._id, db)
          // Once the task is done, send a message back to the main thread
          const m = JSON.stringify({
            message: 'Task completed',
            run, error
          })
          parentPort ? parentPort.postMessage(m) : console.log('parentPort not available')
        }
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
