import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './app/helpers/env';
import { start } from './app/config/db';
import { baseRouter } from './app/routes';
import Trail from './app/services/Logger';

process.on('uncaughtException', (error) => {
  Trail.logError({ message: error.message || 'Uncaught Exception', module: __filename,  type: 'UNCAUGHT_EXCEPTION', metadata: error})
})

const PORT = env('PORT') || 8000

const app = express()
app.use(express.json());
app.use(cookieParser());
app.use(cors())

app.use('/', (req: Request, res: Response, next: NextFunction) => {
  Trail.logRequest({ method: req.method, path: req.path });
  next()
}, baseRouter);

app.use('*', (req: Request, res: Response) => {
  Trail.logRequest({
    method: req.method, path: req.path
  })
  Trail.logResponse({
    message: 'PATH_NOT_FOUND', method: req.method, code: 404, path: req.path
  })
  res.status(404).end(`This path ${req.path} does not exist`)
})

start().then(() => {
  app.listen(PORT, () => {
    console.log(`================= App Listening on port ${PORT} =================`)
  })
}).catch((error) => {
  console.log(new Date(), ' => ', error.message)
  console.log(error.stack)
})
