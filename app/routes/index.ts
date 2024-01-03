import { Router } from "express";
import { authRouter, userRouter } from "./user";
import { configRouter } from "./config";
import { runsRouter } from "./runs";
import { notesRouter } from "./notifications";

export const baseRouter = Router({mergeParams: true});

baseRouter.use('/auth', authRouter);
baseRouter.use('/user', userRouter);
baseRouter.use('/configs', configRouter);
baseRouter.use('/runs', runsRouter);
baseRouter.use('/notifications', notesRouter);
