import { Router } from "express";
import { userAuth } from "../middlewares/auth";
import { signin } from "../controllers/User/signin";
import { signup } from "../controllers/User/signup";
import { signout } from "../controllers/User/signout";
import { getUser } from "../controllers/User/getUser";

export const authRouter = Router();

// signup
// login
// logout
authRouter.route('/signup').post(signup);
authRouter.route('/signin').post(signin);
authRouter.route('/signout').delete(userAuth, signout);

export const userRouter = Router();

authRouter.route('/').get(userAuth, getUser);