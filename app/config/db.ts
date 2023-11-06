import mongoose, { mongo } from 'mongoose';
import { env } from '../helpers/env';

export const start = async () => {
  const db = mongoose.connect(env('DB_URL'))
  mongoose.connection.once('connection', () => {
    console.log('==================== Database connected ======================')
  })
  return db.then((goose) => {
    goose.connection.emit('connection')
  })
}
