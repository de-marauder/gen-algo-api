import { ErrorResponse } from "../../helpers/ErrorBoundarySync"
import { NotificationModel } from "../../models/Notifications"

export const getNotificationsByUser = async (userid: string) => {
  try {
    const data = await NotificationModel.find({ userid }).populate('userid', 'username')
    return { data }
  } catch (error) {
    return { error: new ErrorResponse({ message: `Error while getting user notifications`, errorCode: 'NOTIFICATION_ERROR' }) }
  }
}
export const getAllNotifications = async () => {
  try {
    const data = await NotificationModel.find().populate('userid', 'username')
    return { data }
  } catch (error) {
    return { error: new ErrorResponse({ code: 500, message: 'Error while getting all notifications', errorCode: 'NOTIFICATION_ERROR' }) }
  }
}

export const deleteOneNotificationByUser = async (params: { noteId: string, userid: string }) => {
  try {
    const data = await NotificationModel.deleteOne({ userid: params.userid, _id: params.noteId })
    return { data }
  } catch (error) {
    return { error: new ErrorResponse({ message: 'Error while deleting notification', errorCode: 'NOTIFICATION_ERROR', data: error }) }
  }
}
export const deleteAllNotificationByUser = async (userid: string) => {
  try {
    const data = await NotificationModel.deleteMany({ userid })
    return { data }
  } catch (error) {
    return { error: new ErrorResponse({ message: 'Error while deleting all notifications', errorCode: 'NOTIFICATION_ERROR' }) }
  }
} 