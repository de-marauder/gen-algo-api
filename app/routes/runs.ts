// get runs
// get one run
// delete run
// create run

import { Router } from "express";
import { userAuth } from "../middlewares/auth";
import { getAllRuns, getOneRun } from "../controllers/Runs/get";
import { deleteOneRun } from "../controllers/Runs/delete";
import { createRun } from "../controllers/Runs/create";

export const runsRouter = Router();

runsRouter.route('/runs/:runId')
  .get(userAuth, getOneRun)
  .delete(userAuth, deleteOneRun);

runsRouter.route('/runs')
  .post(userAuth, createRun)
  .get(userAuth, getAllRuns)