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
authRouter.route('/auth/signup').post(signin);
authRouter.route('/auth/signin').post(signup);
authRouter.route('/auth/signout').delete(userAuth, signout);

export const userRouter = Router();

authRouter.route('/user').get(userAuth, getUser);