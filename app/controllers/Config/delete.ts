import { Request, Response } from "express";
import ErrorBoundary, { ErrorResponse } from "../../helpers/ErrorBoundary";
import { ConfigModel } from "../../models/Config";
import { TypeUser } from "../../lib/Types/user";

export const deleteConfig = (req: Request, res: Response) => ErrorBoundary({
  res, req,
  cb: async () => {
    const configId = req.params.configId as string;
    const user = req.body._user as Required<TypeUser>;

    await ConfigModel.deleteOne({ _id: configId, userid: user._id }).catch((error) => {
      console.log(error);
      throw new ErrorResponse({ message: 'Error while deleting config' })
    });

    return res.status(201).json({
      status: 'success',
      message: 'Configuration deleted',
    })
  }
})