import { Document, Types } from "mongoose";
import { TypeRun } from "../lib/Types/runs";
import { NotificationEvent } from "../services/Notification/Notifications";
import { TypeUser } from "../lib/Types/user";
import { env } from "./env";

export const sendRunNotif = (
  run: void | (Document<unknown, {}, TypeRun> & TypeRun & {
    _id: Types.ObjectId;
  }) | undefined,
  error: Error | {
    message: string;
  } | undefined,
  user: Required<TypeUser>
) => {
  if (error) {
    const errorMessage = `An error occured while processing your run.\n${error.message}`
    const errorPayload = {
      data: {
        userid: user._id,
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
    const errorPayload = {
      data: {
        userid: user._id,
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
        userid: user._id,
        message: 'Your run has completed'
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

        click to see more

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