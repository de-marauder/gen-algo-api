// create config
// get config
// delete config

import { Router } from "express";
import { userAuth } from "../middlewares/auth";
import { getManyConfig, getOneConfig } from "../controllers/Config/get";
import { deleteConfig } from "../controllers/Config/delete";
import { createConfig } from "../controllers/Config/create";

export const configRouter = Router({ mergeParams: true });

configRouter.route('/')
  .get(userAuth, getManyConfig)
  .post(userAuth, createConfig);

configRouter.route('/:configId')
  .get(userAuth, getOneConfig)
  .delete(userAuth, deleteConfig);
