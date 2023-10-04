import { NextFunction, Request, Response } from "express"

export type Fn = (req: Request, res: Response, next?: NextFunction) => Promise<void | NextFunction | Response<any, Record<string, any>>>

type Args = {
  req: Request;
  res: Response;
  next?: NextFunction;
  cb: Fn;
}

const ErrorBoundary = ({ req, res, next, cb }: Args) => {
  try {
    cb(req, res)
    if (next) next()
  } catch (error) {
    console.log('Error occured => \n', error)
    if (error instanceof ErrorResponse) {
      return res.status(500).json({
        message: error.message,
        errorCode: error.errorCode,
        code: error.code,
        status: error.status
      })
    }
    res.status(500).json({
      status: 'failed',
      message: (error as Error).message || 'An error occured'
    })
  }
}

export default ErrorBoundary

export class ErrorResponse extends Error {
  message = 'An Error occured'
  errorCode = 'SERVER_ERROR'
  code = 500
  status = 'failed'

  constructor({ message, code, status, errorCode }: { message: string, code?: number, errorCode?: string, status?: string }) {
    super()
    this.message = message
    if (errorCode) this.errorCode = errorCode
    if (code) this.code = code
    if (status) this.status = status
  }
}
