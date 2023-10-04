import express, { Request, Response } from 'express';
import cors from 'cors';
import { env } from './app/helpers/env';
import { start } from './app/config/db';
import { userRouter } from './app/routes/user';
import { configRouter } from './app/routes/config';
import { runsRouter } from './app/routes/runs';


const PORT = env('PORT') || 8000

const app = express()
app.use(express.json());
app.use(cors())

app.use('/api');
app.use(userRouter)
app.use(configRouter)
app.use(runsRouter)

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
