import { Request, Response } from "express";
import ErrorBoundarySync, { ErrorResponse } from "../../helpers/ErrorBoundarySync";
import { validateUserAuthPayload } from "../../helpers/validators";
import { TypeUser } from "../../lib/Types/user";
import { UserModel } from "../../models/User";
import bcrypt from 'bcrypt';
import { env } from "../../helpers/env";
import jwt from "jsonwebtoken";

export const signin = (req: Request, res: Response) => ErrorBoundarySync({
  module: __filename,
  req, res,
  cb: async (req, res) => {

    const newUser = {
      username: req.body.username as string,
      email: req.body.email as string,
      password: req.body.password as string,
    }
    const { error: e } = validateUserAuthPayload(newUser);
    if (e) throw e
    const { user, error } = await loginUser(newUser) as {
      user: Partial<TypeUser>,
      error: Error | ErrorResponse | null | undefined
    };;
    if (error) throw error

    // Set an HTTP-only secure cookie with the token
    res.cookie('jwt-token', `Bearer ${user.token}`, {
      httpOnly: true,
      secure: true, // Set to true in production when using HTTPS
      // sameSite: 'strict', // Recommended for preventing CSRF
      maxAge: 3600000, // Cookie expiration time in milliseconds (1 hour)
      path: '/', // Specify the cookie's path as needed
    })
    // user.token = undefined;
    return res.status(200).json({
      status: 'success',
      message: 'USER_LOGGED_IN',
      data: user
    })
  }
});

const loginUser = async (payload: TypeUser) => {
  try {
    const user = await UserModel.findOne({
      $or: [
        { username: payload.username }, //, password: hashedPassword },
        { email: payload.email } //, password: hashedPassword }
      ]
    });
    if (!user) return { error: new ErrorResponse({ code: 404, errorCode: 'NOT_FOUND', message: 'Incorrect user details' }) };
    const passwordSame = await bcrypt.compare(payload.password as string, user.password as string)
    // const hashedPassword = await bcrypt.hash(payload.password as string, 10)
    // console.log(passwordSame)
    // console.log(hashedPassword)
    // console.log(await UserModel.findOne({ username: payload.username }))
    if (!passwordSame) return { error: new ErrorResponse({ code: 404, errorCode: 'INVALID_PASSWORD', message: 'Incorrect user password' }) };

    const newToken = jwt.sign({ username: payload.username, email: payload.email }, env('JWT_SECRET'));
    user.token = newToken;
    await user.save();
    return {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        token: user.token,
        fcmToken: user.fcmToken
      }
    }
  } catch (error) {
    return { error: error as Error | ErrorResponse }
  }
}