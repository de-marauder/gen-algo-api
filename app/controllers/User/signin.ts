import { Request, Response } from "express";
import ErrorBoundarySync, { ErrorResponse } from "../../helpers/ErrorBoundarySync";
import { validateUserAuthPayload } from "../../helpers/validators";
import { TypeUser } from "../../lib/Types/user";
import { UserModel } from "../../models/User";
import bcrypt from 'bcrypt';
import { env } from "../../helpers/env";
import jwt from "jsonwebtoken";

export const signin = (req: Request, res: Response) => ErrorBoundarySync({
  req, res,
  cb: async (req, res) => {

    const newUser = {
      username: req.body.username as string,
      email: req.body.email as string,
      password: req.body.password as string,
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
    const user = await UserModel.findOne({
      $or: [
        { username: payload.username }, //, password: hashedPassword },
        { email: payload.email } //, password: hashedPassword }
      ]
    });
    if (!user) return { error: new ErrorResponse({ code: 404, errorCode: 'NOT_FOUND', message: 'Incorrect user details' }) };
    const passwordSame = await bcrypt.compare(payload.password as string, user.password as string)
    const hashedPassword = await bcrypt.hash(payload.password as string, 10)
    console.log(passwordSame)
    console.log(hashedPassword)
    console.log(await UserModel.findOne({ username: payload.username }))
    if (!passwordSame) return { error: new ErrorResponse({ code: 404, errorCode: 'INVALID_PASSWORD', message: 'Incorrect user password' }) };

    const newToken = jwt.sign({ username: payload.username, email: payload.email }, env('JWT_SECRET'));
    user.token = newToken;
    await user.save();
    return {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        token: user.token
      }
    }
  } catch (error) {
    return { error: error as Error | ErrorResponse }
  }
}