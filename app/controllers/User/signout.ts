import { Request, Response, NextFunction } from 'express'
import ErrorBoundary, { ErrorResponse } from "../../helpers/ErrorBoundary";
import { UserModel } from '../../models/User';
import { TypeUser } from '../../lib/Types/user';

export const signout = (req: Request, res: Response, next: NextFunction) => ErrorBoundary({
  module: __filename,
  res, req, next,
  cb: async (req, res) => {
    const user = req.body._user as TypeUser;
    if (!user) throw new ErrorResponse({ message: 'User cannot be identified. Please signin again', code: 401, errorCode: 'UNAUTHORIZED' });
    const found = await UserModel.findById(user._id);
    if (!found) throw new ErrorResponse({ message: 'Could not find user with token', code: 401, errorCode: 'UNAUTHORIZED' })
    found.token = '';
    await found.save();
    res.clearCookie('jwt-token')
    return res.status(200).json({
      status: 'success',
      message: 'user logged out'
    })
  }
})
