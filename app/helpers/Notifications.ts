import { Document, Types } from "mongoose";
import { TypeRun } from "../lib/Types/runs";
import { NotificationEvent } from "../services/Notification/Notifications";
import { TypeUser } from "../lib/Types/user";
import { env } from "./env";
import Trail from "../services/Logger";
import { TypeConfig } from "../lib/Types/Config";
import { Result } from "../controllers/Runs/runAlgo";
import { db } from "../config/db";

export const sendRunNotif = (
  run: null | Result | undefined,
  error: Error | {
    message: string;
  } | undefined | null,
  user: Required<TypeUser>
) => {
  if (error) {
    const errorMessage = `An error occured while processing your run.\n${error.message}`
    Trail.logError({
      message: error.message,
      module: __filename,
      type: 'ALGO RUNS ERROR',
      metadata: error,
      db
    })
    const errorPayload = {
      data: {
        userid: user._id.toString(),
        message: errorMessage
      },
      notification: {
        icon: '',
        title: 'RUN FAILED',
        body: errorMessage
      },
      token: user.fcmToken,
    }
    NotificationEvent.send(errorPayload)
  } else if (!run) {
    const errorMessage = 'An error occured while processing your run. The run could not complete'
    Trail.logError({
      message: errorMessage,
      module: __filename,
      type: 'ALGO RUNS ERROR',
      metadata: error,
      db
    })
    const errorPayload = {
      data: {
        userid: user._id.toString(),
        message: errorMessage
      },
      notification: {
        icon: '',
        title: 'RUN FAILED',
        body: errorMessage
      },
      token: user.fcmToken,
    }
    NotificationEvent.send(errorPayload)
  } else {
    const payload = {
      data: {
        userid: user._id.toString(),
        message: `Run #${run.no} for config "${(run.config as unknown as TypeConfig).name}" has completed`,
        link: env('RUN_NOTIFICATION_LINK') + run._id.toString()
      },
      notification: {
        icon: '',
        title: 'RUN COMPLETE',
        body: `
        Run ${run.no} is complete with an error of ${run.error}
        Methane = ${run.outputCH4}
        Hydrogen = ${run.outputH2}
        Carbon dioxide = ${run.outputCO2}
        Carbon monoxide = ${run.outputCO}
        Pressure = ${run.pressure}
        Temperature = ${run.temperature}
        Steam to carbon ratio = ${run.steamToCarbonRatio}

        <button>click to see more</button>

        `
      },
      token: user.fcmToken,
      fcmOptions: {
        link: env('RUN_NOTIFICATION_LINK') + run._id.toString()
      }
    }
    NotificationEvent.send(payload)
  }
}