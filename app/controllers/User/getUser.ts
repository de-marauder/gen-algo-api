import { Request, Response } from "express";
import ErrorBoundary, { ErrorResponse } from "../../helpers/ErrorBoundary";
import { UserModel } from "../../models/User";
import { TypeUser } from "../../lib/Types/user";

export const getUser = (req: Request, res: Response) => ErrorBoundary({
  req, res,
  cb: async (req, res) => {
    const user = req.body._user as TypeUser;

    const u = await UserModel.findById(user._id);
    if (!u) throw new ErrorResponse({ message: 'User not found. Please login again', code: 404, errorCode: 'INVALID_TOKEN' });

    return res.status(200).json({
      status: 'success',
      message: 'user found',
      data: u
    })
  }
});
