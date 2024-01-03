import { Connection } from "mongoose"

const tab = '     '
class Logger {
  constructor() {

  }

  logError(error: {
    message: string,
    type?: string,
    module?: string,
    metadata?: any,
    db?: Connection
  }) {
    console.error(new Date(), ' ==> err ', error.message)
    console.error('Description: ', { ...error, db: undefined })

    error.db ?
      error.db.models.ErrorLogModel ?
        error.db.models.ErrorLogModel.create(error).catch((error) => {
          console.log(tab, error)
        })
        : console.log(tab, "ErrorLogModel Unavailable. Error not saved")
      : console.log(tab, "DB Connection Unavailable. Error not saved")
  }

  logRequest(data: {
    path: string;
    method: string;
    from: string;
    protocol: string;
    host: string
  }) {
    console.log(new Date(), ' ==> req ', data.method, ' - ', data.from, ' - ', data.protocol + '://' + data.host + '/api' + data.path)
  }

  logResponse(data: {
    message: string;
    module: string;
    code: number;
    method: string;
    host: string;
    protocol: string;
    path: string;
  }) {
    console.log(new Date(), ' ==> res ', data.method, ' - ', data.code, ' - ', data.protocol + '://' + data.host + '/api' + data.path, ' - ', data.message, ' - ', data.module)
  }
}

const Trail = new Logger();
export default Trail