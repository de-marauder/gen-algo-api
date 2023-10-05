import { Router } from "express";
import { authRouter, userRouter } from "./user";
import { configRouter } from "./config";
import { runsRouter } from "./runs";

export const baseRouter = Router();

baseRouter.use('/api', authRouter);
baseRouter.use('/api', userRouter);
baseRouter.use('/api', configRouter);
baseRouter.use('/api', runsRouter);
