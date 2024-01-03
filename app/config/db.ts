import mongoose, { ConnectOptions, mongo } from 'mongoose';
import { env } from '../helpers/env';
import Models from "../models";
import { pr } from '../helpers/promise';

interface ExtConnectOpts extends ConnectOptions {
  bufferTimeoutMS?: number
}
export const start = () => {
  mongoose.connect(env('DB_URL'), {
    serverSelectionTimeoutMS: 30000,
    // bufferTimeoutMS: 20000
  } as ExtConnectOpts)
  mongoose.connection.once('connection', () => {
    console.log('==================== Database connected ======================')
  })
  mongoose.connection.on('close', () => {
    console.log('================= Mongoose connection closed =================');
  });
  const db = mongoose.connection
  return db
}
export const db = start()

export const loadModels = () => {
  for (const model of Object.values(Models)) {
    new model()
  }
}

export const waitForDB = (cb: () => void) => {
  const i = setInterval(() => {
    if (db.readyState === mongoose.ConnectionStates.connected) {
      db.emit('connection');
      clearInterval(i);
      // setTimeout(() => {
      pr().then(() => {
        cb()
      })
      // }, 1000);
    } else {
      console.log("DB ", mongoose.ConnectionStates[db.readyState], "...")
    }
  }, 1000);
}