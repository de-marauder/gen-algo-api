import { Request, Response } from "express";
import ErrorBoundarySync, { ErrorResponse } from "../../helpers/ErrorBoundarySync";
import { RunModel } from "../../models/Run";
import { TypeUser } from "../../lib/Types/user";

export const getOneRun = (req: Request, res: Response) => ErrorBoundarySync({
  module: __filename,
  req, res,
  cb: async (req, res) => {
    const user = req.body._user as TypeUser;
    const runId = req.params.runId as string
    const run = await RunModel.findOne({ _id: runId, userid: user._id })
      .populate('config').catch((error) => {
        throw new ErrorResponse({ message: 'Error occured while getting run', errorCode: 'RUN_NOT_FOUND' })
      })
    if (!run)
      throw new ErrorResponse({ message: `Run with id ${runId} does not exist`, errorCode: 'RUN_NOT_FOUND' })
    return res.status(200).json({
      status: 'success',
      message: 'RUN_FOUND',
      data: run
    })
  }
})

export const getAllRuns = (req: Request, res: Response) => ErrorBoundarySync({
  module: __filename,
  req, res,
  cb: async (req, res) => {
    const user = req.body._user as TypeUser;
    const query: { userid: string, config?: string } = {
      userid: user?._id?.toString() as string
    }
    if (req.query.configId) query.config = req.query.configId as string;

    const runs = await RunModel.find(query)
      .populate('config')
      .catch((error) => {
        throw new ErrorResponse({ message: 'Error occured while getting run', errorCode: 'RUN_NOT_FOUND' })
      })
    if (runs.length < 1)
      throw new ErrorResponse({ status: 'success', code: 200, message: `This user has no runs available`, errorCode: 'RUN_NOT_FOUND', data: [] })
    return res.status(200).json({
      status: 'success',
      message: 'RUN_FOUND',
      data: runs
    })
  }
})
