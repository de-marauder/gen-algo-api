import { Request, Response } from "express";
import ErrorBoundary, { ErrorResponse } from "../../helpers/ErrorBoundary";
import { UserModel } from "../../models/User";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { TypeUser } from "../../lib/Types/user";
import { env } from "../../helpers/env";
import { validateUserAuthPayload } from "../../helpers/validators";


export const signup = (req: Request, res: Response) => ErrorBoundary({
  req, res,
  cb: async (req, res) => {
    const newUser = {
      username: req.body.username as string,
      email: req.body.email as string,
      password: req.body.password as string
    }
    const { error: e } = validateUserAuthPayload(newUser);
    if (e) throw e
    const { user, error } = await createUser(newUser);
    if (error) throw error
    return res.status(201).json({
      status: 'success',
      message: 'USER_CREATED',
      data: user
    })
  }
});

const createUser = async (userDetails: TypeUser) => {
  try {
    const exists = await UserModel.findOne({
      $or: [
        { username: userDetails.username },
        { email: userDetails.email },
      ]
    })
    if (exists) {
      const e = new ErrorResponse({ code: 400, errorCode: 'USER_EXISTS', message: 'User already exists' });
      return { error: e }
    }
    const password = userDetails.password as string;
    delete userDetails.password;
    const user = new UserModel(userDetails)
    const token = jwt.sign(user, env('JWT_SECRET'), {
      expiresIn: '24h'
    })
    const hashedPassword = await bcrypt.hash(password, 10)
    user.password = hashedPassword;
    user.token = token;
    await user.save();

    return { user: { username: user.username, email: user.email, token: token } }
  } catch (error) {
    return { error: error as Error | ErrorResponse }
  }
}

