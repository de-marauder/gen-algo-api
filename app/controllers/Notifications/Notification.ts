import { NextFunction, Request, Response } from "express";
import ErrorBoundary from "../../helpers/ErrorBoundary";
import { deleteAllNotificationByUser, deleteOneNotificationByUser, getAllNotifications, getNotificationsByUser } from "./NotificationCRUD";
import { TypeUser } from "../../lib/Types/user";

export const getByUser = (req: Request, res: Response, next: NextFunction) => ErrorBoundary({
  module: __filename,
  req, res, next,
  cb: async (req, res) => {
    const user = req.body._user as Required<TypeUser>

    const { data, error } = await getNotificationsByUser(user._id)
    if (error) throw error

    return res.status(200).json({
      status: 'success',
      message: 'Notification found',
      data
    })
  }
})
export const getAll = (req: Request, res: Response, next: NextFunction) => ErrorBoundary({
  module: __filename,
  req, res, next,
  cb: async (req, res) => {

    const { data, error } = await getAllNotifications()
    if (error) throw error

    return res.status(200).json({
      status: 'success',
      message: 'Notifications found',
      data
    })
  }
})

export const deleteOne = (req: Request, res: Response, next: NextFunction) => ErrorBoundary({
  module: __filename,
  req, res, next,
  cb: async (req, res) => {
    const user = req.body._user as Required<TypeUser>
    const noteId = req.params.noteId as string

    const { data, error } = await deleteOneNotificationByUser({ userid: user._id, noteId })
    if (error) throw error

    return res.status(200).json({
      status: 'success',
      message: 'Notification deleted',
      data
    })
  }
})

export const deleteMany = (req: Request, res: Response, next: NextFunction) => ErrorBoundary({
  module: __filename,
  req, res, next,
  cb: async (req, res) => {
    const user = req.body._user as Required<TypeUser>

    const { data, error } = await deleteAllNotificationByUser(user._id)
    if (error) throw error

    return res.status(200).json({
      status: 'success',
      message: 'Notifications deleted',
      data
    })
  }
})
