import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken'
import ErrorBoundary, { Fn, ErrorResponse } from "../helpers/ErrorBoundary";
import { TypeUser } from "../lib/Types/user";
import { UserModel } from "../models/User";

export const userAuth = (req: Request, res: Response, next: NextFunction) => ErrorBoundary({
  req, res, next, cb
})

const cb: Fn = async (req, res, next) => {

  const bearerToken = req.headers.authorization;
  if (!bearerToken) throw new ErrorResponse({ message: 'Please pass authorization header' });
  const token = bearerToken.split(' ')[1]
  const decodedToken = jwt.decode(token) as TypeUser
  const user = await UserModel.findById(decodedToken._id);
  if (!user) throw new ErrorResponse({ code: 404, errorCode: 'USER_NOT_FOUND', message: 'The user with this token no longer exists' })
  if (user.token !== token) new ErrorResponse({ code: 401, errorCode: 'INVALID_TOKEN', message: 'Please login again' })

  req.body._user = user;
  if (next) return next()
  else return res.status(500).send('Middleware Error!')
}