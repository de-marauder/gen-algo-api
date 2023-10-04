import { Request, Response } from "express";
import ErrorBoundary, { ErrorResponse } from "../../helpers/ErrorBoundary";
import { validateUserAuthPayload } from "../../helpers/validators";
import { TypeUser } from "../../lib/Types/user";
import { UserModel } from "../../models/User";
import bcrypt from 'bcrypt';
import { env } from "../../helpers/env";
import jwt from "jsonwebtoken";

export const signin = (req: Request, res: Response) => ErrorBoundary({
  req, res,
  cb: async (req, res) => {
    const bearerToken = req.headers.authorization;
    if (!bearerToken) throw new ErrorResponse({ code: 401, status: 'failed', errorCode: 'NOT_AUTHORIZED', message: 'Please pass authorization header' })
    const newUser = {
      username: req.body.username as string,
      email: req.body.email as string,
      password: req.body.password as string,
      token: bearerToken.split(' ')[1],
    }
    const { error: e } = validateUserAuthPayload(newUser);
    if (e) throw e
    const { user, error } = await loginUser(newUser);
    if (error) throw error
    return res.status(200).json({
      status: 'success',
      message: 'USER_LOGGED_IN',
      data: user
    })
  }
});

const loginUser = async (payload: TypeUser) => {
  try {
    const hashedPassword = await bcrypt.hash(payload.password as string, 10)
    const newToken = jwt.sign({ username: payload.username, email: payload.email }, env('JWT_SECRET'))
    const user = await UserModel.findOne({
      $or: [
        { username: payload.username, password: hashedPassword },
        { email: payload.email, password: hashedPassword }
      ]
    }).select('-password');
    if (!user) return { error: new ErrorResponse({ code: 404, status: 'failed', errorCode: 'NOT_FOUND', message: 'Incorrect user details' }) };
    user.token = newToken;
    await user.save();
    return { user }
  } catch (error) {
    return { error: error as Error | ErrorResponse }
  }
}