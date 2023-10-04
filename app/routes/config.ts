// create config
// get config
// delete config

import { Router } from "express";
import { userAuth } from "../middlewares/auth";
import { getManyConfig, getOneConfig } from "../controllers/Config/get";
import { deleteConfig } from "../controllers/Config/delete";
import { createConfig } from "../controllers/Config/create";

export const configRouter = Router();

configRouter.get('/config/all', userAuth, getManyConfig);
configRouter.route('/config/:configId').get(userAuth, getOneConfig).delete(userAuth, deleteConfig);
configRouter.post('/config', userAuth, createConfig);
