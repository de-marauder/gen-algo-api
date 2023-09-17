import { NextFunction, Request, Response } from "express"

type Fn = (req: Request, res: Response, next?: NextFunction) => Promise<void> | Promise<NextFunction> | Promise<Response<any, Record<string, any>>>

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
    res.json({
      error: (error as Error).message || 'An error occured'
    })
  }
}

export default ErrorBoundary