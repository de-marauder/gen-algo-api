import { Document, Types } from "mongoose";
import { TypeRun } from "../lib/Types/runs";
import { NotificationEvent } from "../services/Notification/Notifications";
import { TypeUser } from "../lib/Types/user";

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
    const errorMessage = `Your run has run into an error\n${error.message}`
    const errorPayload = {
      data: {
        userid: user._id,
        message: errorMessage
      },
      notification: {
        body: errorMessage
      },
      token: user.fcmToken
    }
    NotificationEvent.send(errorPayload)
  } else if (!run) {
    const errorMessage = `Your run has run into an error`
    const errorPayload = {
      data: {
        userid: user._id,
        message: errorMessage
      },
      notification: {
        body: errorMessage
      },
      token: user.fcmToken
    }
    NotificationEvent.send(errorPayload)
  } else {
    const payload = {
      data: {
        userid: user._id,
        message: 'Your run has completed'
      },
      notification: {
        body: `run ${run._id} is complete`
      },
      token: user.fcmToken
    }
    NotificationEvent.send(payload)
  }
}