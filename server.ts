import express, { Request, Response } from 'express';
import cors from 'cors';
import { env } from './app/helpers/env';
import { start } from './app/config/db';
import { runAlgorithm } from './app/controllers/runAlgo';


const PORT = env('PORT') || 8000 

const app = express()
app.use(express.json());
// app.use(bodyParser)
app.use(cors())

app.post('/api/run-algo', runAlgorithm);

app.use('*', (req: Request, res: Response)=>{
  res.status(404).end(`This path ${req.path} does not exist`)
})

start().then(()=>{
  app.listen(PORT, ()=>{
    console.log(`================= App Listening on port ${PORT} =================`)
  })
})
