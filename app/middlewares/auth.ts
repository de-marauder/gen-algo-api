import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken'
import ErrorBoundarySync, { Fn, ErrorResponse } from "../helpers/ErrorBoundarySync";
import { TypeUser } from "../lib/Types/user";
import { UserModel } from "../models/User";

export const userAuth = (req: Request, res: Response, next: NextFunction) => ErrorBoundarySync({
  req, res, next, cb
})

const cb: Fn = async (req, res, next) => {

  const bearerToken = req.headers.authorization;
  if (!bearerToken) throw new ErrorResponse({ code: 401, errorCode: 'UNAUTHORIZED' , message: 'Please pass authorization header' });
  const token = bearerToken.split(' ')[1]
  const decodedToken = jwt.decode(token) as TypeUser
  const user = await UserModel.findOne({email: decodedToken.email});
  if (!user) throw new ErrorResponse({ code: 404, errorCode: 'USER_NOT_FOUND', message: 'The user with this token no longer exists' })
  if (user.token !== token) throw new ErrorResponse({ code: 401, errorCode: 'INVALID_TOKEN', message: 'Please login again' })

  req.body._user = user;
  if (next) next()
  // else return res.status(500).send('Middleware Error!')
}