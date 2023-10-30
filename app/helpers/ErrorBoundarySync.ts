import { NextFunction, Request, Response } from "express"
import Trail from "../services/Logger";

export type Fn = (req: Request, res: Response, next?: NextFunction) => Promise<void | NextFunction | Response<any, Record<string, any>>>

type Args = {
  req: Request;
  res: Response;
  next?: NextFunction;
  cb: Fn;
}

const ErrorBoundarySync = async ({ req, res, next, cb }: Args) => {
  try {
    await cb(req, res).catch((error) => {
      throw error
    })
    if (next) next()
  } catch (error) {
    // console.log('Error occured => \n', error)

    if (error instanceof ErrorResponse) {
      Trail.logResponse({
        message: error.message,
        method: req.method,
        code: error.code,
        path: req.path
      })
      return res.status(error.code || 500).json({
        message: error.message,
        errorCode: error.errorCode,
        status: error.status,
      })
    }


    Trail.logResponse({
      message: (error as Error).message,
      method: req.method,
      code: 500,
      path: req.path
    })
    res.status(500).json({
      status: 'failed',
      message: (error as Error).message || 'An error occured'
    })
  }
}

export default ErrorBoundarySync

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

    Trail.logError({ message, metadata: data })
  }
}
