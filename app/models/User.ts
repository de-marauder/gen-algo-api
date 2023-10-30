import { Schema, model } from 'mongoose';
import { TypeUser } from '../lib/Types/user';

const UserSchema = new Schema<TypeUser>(
  {
    username: String,
    email: String,
    password: String,
    token: String,
    fcmToken: String,
  },
  {
    timestamps: true
  }
)

export const UserModel = model('UserModel', UserSchema, 'UserModel')
