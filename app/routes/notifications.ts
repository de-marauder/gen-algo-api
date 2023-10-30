import { Router } from "express";
import { deleteMany, deleteOne, getByUser } from "../controllers/Notifications/Notification";
import { userAuth } from "../middlewares/auth";
import { subscribe, unsubscribe } from "../controllers/Notifications/subscribe";


export const notesRouter = Router();

// signup
// login
// logout
notesRouter.use(userAuth)
notesRouter.route('/notifications/')
.get(getByUser)
.delete(deleteMany)
notesRouter.patch('/notifications/subscribe', subscribe)
notesRouter.patch('/notifications/unsubscribe', unsubscribe)
notesRouter.route('/notifications/:noteId').delete(deleteOne)

