import { Request, Response } from "express";
import ErrorBoundarySync, { ErrorResponse } from "../../helpers/ErrorBoundarySync";
import { UserModel } from "../../models/User";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { TypeUser } from "../../lib/Types/user";
import { env } from "../../helpers/env";
import { validateUserAuthPayload } from "../../helpers/validators";


export const signup = (req: Request, res: Response) => ErrorBoundarySync({
  module: __filename,
  req, res,
  cb: async (req, res) => {
    const newUser = {
      username: req.body.username as string,
      email: req.body.email as string,
      password: req.body.password as string
    }
    const { error: e } = validateUserAuthPayload(newUser);
    if (e) throw e
    const { user, error } = (await createUser(newUser)) as {
      user: Partial<TypeUser>,
      error: Error | ErrorResponse | null | undefined
    };
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
    const token = jwt.sign(userDetails, env('JWT_SECRET'), {
      expiresIn: '24h'
    })
    const hashedPassword = await bcrypt.hash(password, 10)
    user.password = hashedPassword;
    user.token = token;
    await user.save();

    return { user: { _id: user._id, username: user.username, email: user.email, token: token } }
  } catch (error) {
    return { error: error as Error | ErrorResponse }
  }
}

