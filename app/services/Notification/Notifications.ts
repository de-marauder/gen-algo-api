import path from 'path'
import { initializeApp, App } from 'firebase-admin/app';
import { credential } from 'firebase-admin';
import { getMessaging, Notification } from 'firebase-admin/messaging';
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
  };
  notification?: Notification,
  token: string
}

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
    this.on('send', (payload: INotifs) => {
      getMessaging(this.app).send(payload)
        .then((response) => {
          // Response is a message ID string.
          console.log('Successfully sent message:', response);
          // this.model.create(payload.data)
          //   .catch((error) => {
          //     console.log('Error saving Notification')
          //     Trail.logError({
          //       message: 'Error saving Notification',
          //       module: __filename,
          //       metadata: error
          //     })
          //   })
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

  private buildNotificationPayload({ data, notification, token }: Required<INotifs>): INotifs {
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

  send(payload: Required<INotifs>) {
    this.emit('send', this.buildNotificationPayload(payload))
    const args = [
      payload.data?.message,
      payload.notification?.body,
      payload.data?.userid
    ]
    if (!args[0]) { throw new Error('Could not save Notification.') }
    if (!args[1]) { throw new Error('Could not save Notification.') }
    if (!args[2]) { throw new Error('Could not save Notification.') }

    if (args.length === 2) this.save(...args)
  }

  private save(message?: string, body?: string, userid?: string) {
    this.model.create({ message, body, userid }).catch((error) => {
      Trail.logError({
        message: 'Notification not saved',
        module: __filename,
        metadata: error
      })
    })
  }

}


export const NotificationEvent = new NotificationService()