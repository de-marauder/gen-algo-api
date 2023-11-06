import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './app/helpers/env';
import { start } from './app/config/db';
import { baseRouter } from './app/routes';
import Trail from './app/services/Logger';

process.on('uncaughtException', (error) => {
  Trail.logError({ message: error.message || 'Uncaught Exception', module: __filename, type: 'UNCAUGHT_EXCEPTION', metadata: error })
})

const PORT = env('PORT') || 8000

const app = express()
app.use(express.json());
app.use(cookieParser());
app.use(cors())

const reqLogger = (req: Request, res: Response, next: NextFunction) => {
  Trail.logRequest({ method: req.method, path: req.path });
  next()
}

const resLogger = (req: Request, res: Response) => {
  Trail.logResponse({
    module: __filename,
    message: (res as unknown as { message: string }).message || 'PATH_NOT_FOUND', method: req.method, code: 404, path: req.path
  })
}

// TODO: 
// 1. Make all controllers call next so you can log their response here
// 2. Abstract the the sending of a response with a custom function that passes the controller module name `${__filename}`
// 3. Figure out why the userAuth middleware does not require an invocation of next()

app.use('/api', reqLogger, baseRouter, /** resLogger */);

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

start().then(() => {
  app.listen(PORT, () => {
    console.log(`================= App Listening on port ${PORT} =================`)
  })
}).catch((error) => {
  Trail.logError({
    module: __filename,
    type: 'DB_ERROR',
    message: error.message,
    metadata: error
  });
})
