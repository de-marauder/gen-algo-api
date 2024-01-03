import { NextFunction, Request, Response } from "express"
import Trail from "../services/Logger";
import { db } from "../config/db";
import { pr } from "./promise";

export type Fn = (req: Request, res: Response, next?: NextFunction) => Promise<void | NextFunction | Response<any, Record<string, any>>>
export interface CustomResponse extends Response {
  message?: string;
  controllerModule?: string;
}
type Args = {
  module: string;
  req: Request;
  res: CustomResponse;
  next?: NextFunction;
  cb: Fn;
  type?: 'sync' | 'async'
}

const ErrorBoundary = async ({ module, req, res, next, cb, type }: Args) => {
  try {
    switch (type) {
      case 'async':
        cb(req, res, next).then(() => {
          res.message = 'SUCCESS'
          res.controllerModule = module
          if (next) next()
        })
          .catch((error) => {
            res.message = (error as ErrorResponse).errorCode
            res.controllerModule = module
            respondOnError({ req, res, module, error: error as Error | ErrorResponse })

          });
      case 'sync':
        await cb(req, res, next).then(() => {
          res.message = 'SUCCESS'
          res.controllerModule = module
          if (next) next()
        })
          .catch((error) => {
            res.message = (error as ErrorResponse).errorCode
            respondOnError({ req, res, module, error: error as Error | ErrorResponse })
          })
      default:
        pr()
          .then(() => {
            cb(req, res, next).then(() => {
              res.message = 'SUCCESS';
              res.controllerModule = module;
              if (next) next()
            })
              .catch((error) => {
                res.message = (error as ErrorResponse).errorCode
                res.controllerModule = module
                respondOnError({ req, res, module, error: error as Error | ErrorResponse })
              })
          })
    }
  } catch (error) {
    res.message = (error as ErrorResponse).errorCode || 'UNKOWN_ERROR'
    respondOnError({ req, res, module, error: error as Error | ErrorResponse })
  }
}

export default ErrorBoundary

export class ErrorResponse extends Error {
  message = 'An Error occured'
  errorCode = 'SERVER_ERROR'
  code = 500
  status = 'failed'
  data = undefined

  constructor({ message, code, status, errorCode, data }: { message: string, code?: number, errorCode?: string, status?: string, data?: any }) {
    super()
    this.message = message
    if (errorCode) this.errorCode = errorCode;
    if (code) this.code = code;
    if (status) this.status = status;
    if (data) this.data = data;

    Trail.logError({ message, type: errorCode, metadata: data, db })
  }
}

const respondOnError = ({
  req, res, error, module
}: Pick<Args, 'req' | 'res' | 'module'> & { error: Error | ErrorResponse }) => {
  if (error instanceof ErrorResponse) {
    Trail.logResponse({
      message: error.message,
      module,
      method: req.method,
      code: error.code,
      path: req.path,
      host: req.hostname,
      protocol: req.protocol
    })
    return res.status(error.code || 500).json({
      message: error.message,
      errorCode: error.errorCode,
      status: error.status,
    })
  }

  res.status(500).json({
    status: 'failed',
    message: (error as Error).message || 'An error occured'
  })

  Trail.logResponse({
    message: (error as Error).message,
    module: module || '',
    method: req.method,
    code: 500,
    path: req.path,
    host: req.hostname,
    protocol: req.protocol
  })
  Trail.logError({
    message: (error as Error).message,
    module,
    type: (error as ErrorResponse).errorCode || 'INTERNAL_SERVER_ERROR',
    metadata: error,
    db
  })
}
