import {model, Schema} from 'mongoose';

const ErrorSchema = new Schema(
  {
    message: String,
    module: String,
    metadata: Schema.Types.Mixed
  }
) 

export const ErrorLogModel = model('ErrorLogModel', ErrorSchema, 'ErrorLogModel');