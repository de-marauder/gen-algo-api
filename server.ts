import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import * as http from 'http';
import cookieParser from 'cookie-parser';
import { env } from './app/helpers/env';
import { db, loadModels, waitForDB } from './app/config/db';
import { baseRouter } from './app/routes';
import Trail from './app/services/Logger';
import { pr } from './app/helpers/promise';
import mongoose, { Connection } from 'mongoose';
import { CustomResponse } from './app/helpers/ErrorBoundary';

process.on('uncaughtException', (error) => {
  Trail.logError({ message: error.message || 'Uncaught Exception', module: __filename, type: 'UNCAUGHT_EXCEPTION', metadata: error, db })
})

const PORT = env('PORT') || 8000

var server: http.Server;
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors())

const reqLogger = (req: Request, res: Response, next: NextFunction) => {
  Trail.logRequest({
    method: req.method,
    path: req.url,
    host: req.hostname,
    protocol: req.protocol,
    from: req.ip
  });
  next()
}

const resLogger = async (req: Request, res: CustomResponse) => {
  pr().then(() => {
    Trail.logResponse({
      module: res.controllerModule || __filename,
      message: res.message || 'PATH_NOT_FOUND',
      method: req.method,
      code: res.statusCode,
      path: req.path,
      host: req.hostname,
      protocol: req.protocol
    })
  })
}

app.use('/api', reqLogger, baseRouter, resLogger);

app.all('*', reqLogger, (req: Request, res: Response, next: NextFunction) => {
  res.status(404).end(`This path ${req.path} does not exist`)
  next()
}, resLogger)

app.use((req, res) => {
  res.status(500).json({
    status: 'failed',
    message: 'erro occured'
  })
})

pr()
  .then(() => {
    console.log("================== SERVER STARTING ======================")
    waitForDB(() => {
      loadModels();
      console.log("------------ Models loaded --------------")
    })
  })
  .then(() => {
    if (!server) {
      server = app.listen(PORT, () => {
        console.log(`================= App Listening on port ${PORT} =================`)
      })
    }
    server.on('error', (err: Error & { code: string }) => {
      Trail.logError({
        module: __filename,
        type: err.code === 'EADDRINUSE' ? 'EADDRINUSE_SERVER_ERROR' : 'SERVER_ERROR',
        message: err.code === 'EADDRINUSE' ?
          `Server attempted to rebind on port ${PORT} but it is already in use. ` + err.message
          : err.message,
        metadata: err,
        db
      });
    });
  })
  .catch((error) => {
    Trail.logError({
      module: __filename,
      type: 'DB_ERROR',
      message: error.message,
      metadata: error,
      db
    });
    db.close()
  })
