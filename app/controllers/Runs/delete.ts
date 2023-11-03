import { Request, Response } from "express";
import ErrorBoundarySync, { ErrorResponse } from "../../helpers/ErrorBoundarySync";
import { RunModel } from "../../models/Run";
import { TypeUser } from "../../lib/Types/user";

export const deleteOneRun = (req: Request, res: Response) => ErrorBoundarySync({
  module: __filename,
  req, res,
  cb: async (req, res) => {
    // console.log('delete route hit')
    const user = req.body._user as TypeUser;
    const runId = req.params.runId as string
    const run = await RunModel.findOneAndDelete({ _id: runId, userid: user._id })
      .catch((error) => {
        console.log(error);
        throw new ErrorResponse({ message: 'Error occured while deleting run', errorCode: 'RUN_NOT_DELETED' })
      })
    if (!run)
      throw new ErrorResponse({ code: 404, message: `Run with id ${runId} does not exist`, errorCode: 'RUN_NOT_FOUND' })
    // console.log('run: ', run)
    return res.status(200).json({
      status: 'success',
      message: 'RUN_DELETED',
      data: run
    })
  }
})
