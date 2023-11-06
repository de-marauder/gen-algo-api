import path from 'path'
import { initializeApp, App } from 'firebase-admin/app';
import { credential } from 'firebase-admin';
import { getMessaging, Message, Notification } from 'firebase-admin/messaging';
import EventEmitter from 'node:events'
import { NotificationModel } from '../../models/Notifications';
import { UserModel } from '../../models/User';
import { ErrorResponse } from '../../helpers/ErrorBoundarySync';
import Trail from '../Logger';
// import serviceAccount from './gen-algo-firebase-adminsdk-9t7qo-3d25902959.json'

interface INotifs {
  data?: {
    userid?: string;
    message?: string;
    link?: string;
  };
  notification?: Notification,
  fcmOptions?: {
    link?: string;
  }
  token: string
}
type PartialFields<T, K extends keyof T> = {
  [P in K]?: T[P];
} & {
    [P in Exclude<keyof T, K>]: T[P];
  };

const serviceAccountFile = 'gen-algo-firebase-adminsdk-9t7qo-3d25902959.json';
const serviceAccount = path.join(__dirname, serviceAccountFile);

class NotificationService extends EventEmitter {

  app: App | undefined;
  model = NotificationModel

  constructor() {
    super()
    try {
      this.app = initializeApp({
        credential: credential.cert(serviceAccount)
      });
    } catch (error) {
      Trail.logError({
        message: 'FCM Not initialized',
        module: __filename,
        metadata: error
      })
    }


    this.registerSendEvent()
  }

  async subscribe(params: { token: string, userid: string }) {
    return UserModel.findOne({ _id: params.userid }).select('fcmToken').then((user) => {
      if (user) {
        user.fcmToken = params.token;
        user.save()
        return { data: user }
      }
      return {
        error: new ErrorResponse({
          message: 'Something went wrong while subscribing',
          errorCode: 'NOTIFICATION_ERROR'
        })
      }
    })
  }

  async unsubscribe(params: { token: string, userid: string }) {
    return UserModel.findOne({ _id: params.userid, fcmToken: params.token }, { fcmToken: '1' }).then((user) => {
      if (user) {
        user.fcmToken = '';
        user.save()
        return { data: user }
      }
      return {
        error: new ErrorResponse({
          message: 'Something went wrong while unsubscribing',
          errorCode: 'NOTIFICATION_ERROR'
        })
      }
    })
  }

  private registerSendEvent() {
    this.on('send', (payload: Message) => {
      getMessaging(this.app).send(payload)
        .then((response) => {
          // Response is a message ID string.
          console.log('Successfully sent message:', response);
        })
        .catch((error) => {
          Trail.logError({
            message: 'Error sending Notification',
            module: __filename,
            metadata: error
          })
        });
    })
  }

  private buildNotificationPayload({ data, notification, token }: PartialFields<Required<INotifs>, 'fcmOptions'>): INotifs {
    return {
      data: {
        userid: data.userid,
        message: data.message
      },
      notification: {
        imageUrl: notification.imageUrl,
        title: notification.title,
        body: notification.body
      },
      token
    }
  }

  send(payload: PartialFields<Required<INotifs>, 'fcmOptions'>) {
    this.emit('send', this.buildNotificationPayload(payload))
    const args = [
      payload.data?.message,
      payload.notification?.body,
      payload.data?.link,
      payload.data?.userid
    ]
    if (!args[0]) { throw new Error('Could not save Notification.') }
    if (!args[1]) { throw new Error('Could not save Notification.') }
    if (!args[3]) { throw new Error('Could not save Notification.') }

    if (args.length === 4) this.save(...args)
    else {
      Trail.logError({
        message: 'Notification not saved',
        module: __filename,
        metadata: {
          details: `Could not save notificaiton. Expected 3 arguments got ${args.length}`,
          notification: payload
        }
      })
    }
  }

  private save(message?: string, body?: string, link?: string,  userid?: string) {
    this.model.create({ message, body, link, userid }).catch((error) => {
      Trail.logError({
        message: 'Notification not saved',
        module: __filename,
        metadata: error
      })
    })
  }

}


export const NotificationEvent = new NotificationService()