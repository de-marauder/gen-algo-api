import { Request, Response } from "express"
import ErrorBoundarySync, { ErrorResponse } from "../../helpers/ErrorBoundarySync"
import { NotificationEvent } from "../../services/Notification/Notifications"
import { TypeUser } from "../../lib/Types/user"

export const subscribe = (req: Request, res: Response) => ErrorBoundarySync({
  module: __filename,
  req, res,
  cb: async (req, res) => {
    const user = req.body._user as Required<TypeUser>

    const { data, error } = await NotificationEvent.subscribe({
      token: req.body.fcmToken,
      userid: user._id
    })
      .catch((error) => {
        throw new ErrorResponse({ message: 'Error while subscribing for notifications' })
      })

    if (error) throw error

    return res.status(200).json({
      status: 'success',
      message: 'Notification Subscription enabled',
      data
    })
  }
})

export const unsubscribe = (req: Request, res: Response) => ErrorBoundarySync({
  module: __filename,
  req, res,
  cb: async (req, res) => {
    const user = req.body._user as Required<TypeUser>

    const { data, error } = await NotificationEvent.unsubscribe({
      token: user.fcmToken,
      userid: user._id
    })
      .catch((error) => {
        throw new ErrorResponse({ message: 'Error while subscribing for notifications' })
      })
    if (error) throw error

    return res.status(200).json({
      status: 'success',
      message: 'Notification Subscription disabled',
      data
    })
  }
})