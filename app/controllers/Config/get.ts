import { Request, Response } from 'express';
import ErrorBoundary, { ErrorResponse } from '../../helpers/ErrorBoundary';
import { ConfigModel } from '../../models/Config';
import { UserModel } from '../../models/User';
import { TypeUser } from '../../lib/Types/user';

export const getOneConfig = (req: Request, res: Response) => ErrorBoundary({
  res, req,
  cb: async () => {
    const user = req.body._user as TypeUser;
    const configId = req.params.configId as string;
    const config = await ConfigModel.findOne({ _id: configId, userid: user._id }).catch((error) => {
      console.log(error);
      throw new ErrorResponse({ message: 'Error while getting config' })
    });
    if (!config) throw new ErrorResponse({ code: 404, message: `Configuration with id ${configId} not found`, errorCode: 'CONFIG_NOT_FOUND' })

    return res.status(201).json({
      status: 'success',
      message: 'Configuration created',
      data: config
    })
  }
})

export const getManyConfig = (req: Request, res: Response) => ErrorBoundary({
  res, req,
  cb: async () => {
    const user = req.body._user as TypeUser;

    const configs = await ConfigModel.find({ userid: user._id }).catch((error) => {
      console.log(error);
      throw new ErrorResponse({ message: 'Error while getting configurations' })
    });
    if (configs.length < 1) throw new ErrorResponse({ code: 200, message: `${user.username} has no configurations set`, errorCode: 'CONFIG_NOT_FOUND' })

    return res.status(201).json({
      status: 'success',
      message: 'Configuration created',
      data: configs
    })
  }
})
