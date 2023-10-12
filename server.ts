import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './app/helpers/env';
import { start } from './app/config/db';
import { baseRouter } from './app/routes';


const PORT = env('PORT') || 8000

const app = express()
app.use(express.json());
app.use(cookieParser());
app.use(cors())

app.use('/', baseRouter);

app.use('*', (req: Request, res: Response) => {
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
