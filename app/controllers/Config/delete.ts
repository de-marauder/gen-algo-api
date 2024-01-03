import { Request, Response, NextFunction } from "express";
import ErrorBoundary, { ErrorResponse } from "../../helpers/ErrorBoundary";
import { ConfigModel } from "../../models/Config";
import { TypeUser } from "../../lib/Types/user";

export const deleteConfig = (req: Request, res: Response, next: NextFunction) => ErrorBoundary({
  module: __filename,
  res, req, next,
  cb: async () => {
    const configId = req.params.configId as string;
    const user = req.body._user as Required<TypeUser>;

    const config = await ConfigModel.findOneAndDelete({ _id: configId, userid: user._id }).catch((error) => {
      throw new ErrorResponse({ message: 'Error while deleting config' })
    });
    if (!config) throw new ErrorResponse({ code: 404, message: `Config with id ${configId} does not exist`, errorCode: 'CONFIG_NOT_FOUND' })
    return res.status(200).json({
      status: 'success',
      message: 'Configuration deleted',
    })
  }
})