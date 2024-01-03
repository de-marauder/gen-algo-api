import { Request, Response, NextFunction } from 'express';
import ErrorBoundary, { ErrorResponse } from '../../helpers/ErrorBoundary';
import { ConfigModel } from '../../models/Config';
import { UserModel } from '../../models/User';
import { TypeUser } from '../../lib/Types/user';

export const getOneConfig = (req: Request, res: Response, next: NextFunction) => ErrorBoundary({
  module: __filename,
  res, req, next,
  cb: async () => {
    const user = req.body._user as TypeUser;
    const configId = req.params.configId as string;
    const config = await ConfigModel.findOne({ _id: configId, userid: user._id?.toString() }).catch((error) => {
      throw new ErrorResponse({ errorCode: 'CONFIG_NOT_FOUND', message: 'Error while getting config' })
    });
    if (!config) throw new ErrorResponse({ code: 404, message: `Configuration with id ${configId} not found`, errorCode: 'CONFIG_NOT_FOUND' })

    return res.status(200).json({
      status: 'success',
      message: 'Configuration found',
      data: config
    })
  }
})

export const getManyConfig = (req: Request, res: Response, next: NextFunction) => ErrorBoundary({
  module: __filename,
  res, req, next,
  cb: async () => {
    const user = req.body._user as TypeUser;
    const query: {
      userid: string;
    } = {
      userid: user._id?.toString() as string
    }

    const configs = await ConfigModel.find(query).catch((error) => {
      throw new ErrorResponse({ errorCode: 'CONFIG_NOT_FOUND', message: 'Error while getting configurations' })
    });
    if (configs.length < 1) throw new ErrorResponse({ status: 'success', code: 200, message: `${user.username} has no configurations set`, errorCode: 'CONFIG_NOT_FOUND', data: [] })

    return res.status(200).json({
      status: 'success',
      message: 'Configurations found',
      data: configs
    })
  }
})
