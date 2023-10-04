import { Request, Response } from "express";
import ErrorBoundary, { ErrorResponse } from "../../helpers/ErrorBoundary";
import { TypeConfig } from "../../lib/Types/Config";
import { ConfigModel } from "../../models/Config";
import { TypeUser } from "../../lib/Types/user";

export const createConfig = (req: Request, res: Response) => ErrorBoundary({
  res, req,
  cb: async () => {
    const configPayload = req.body.config as TypeConfig;
    const user = req.body._user as Required<TypeUser>;
    configPayload.userid = user._id;
    const config = await ConfigModel.create(configPayload).catch((error) => {
      console.log(error);
      throw new ErrorResponse({ message: 'Error while creating config' })
    });

    return res.status(201).json({
      status: 'success',
      message: 'Configuration created',
      data: config
    })
  }
})