import { model, Schema } from 'mongoose';

const NotificationSchema = new Schema(
  {
    userid: { type: Schema.Types.ObjectId, ref: 'UserModel' },
    message: String,
  },
  {
    timestamps: true
  }
)

export const NotificationModel = model('NotificationModel', NotificationSchema, 'NotificationModel') 
