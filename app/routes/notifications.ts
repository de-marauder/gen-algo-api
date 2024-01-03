import { Router } from "express";
import { deleteMany, deleteOne, getByUser } from "../controllers/Notifications/Notification";
import { userAuth } from "../middlewares/auth";
import { subscribe, unsubscribe } from "../controllers/Notifications/subscribe";

export const notesRouter = Router({ mergeParams: true });

notesRouter.use(userAuth)
notesRouter.route('/')
  .get(getByUser)
  .delete(deleteMany)
notesRouter.patch('/subscribe', subscribe)
notesRouter.patch('/unsubscribe', unsubscribe)
notesRouter.route('/:noteId').delete(deleteOne)

