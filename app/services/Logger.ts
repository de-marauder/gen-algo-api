import { ErrorLogModel } from "../models/Error"

class Logger {
  constructor() {

  }

  logError(error: {
    message: string,
    type?: string,
    module?: string,
    metadata?: any
  }) {
    console.log(new Date(), ' ==> err ', error.message)
    console.error(error)
    ErrorLogModel.create(error)
  }
  
  logRequest(data: { 
    path: string,
    method: string
  }) {
    console.log(new Date(), ' ==> req ', data.method, ' - ', data.path)
  }

  logResponse(data: { 
    message: string,
    code: number,
    method: string,
    path: string,
  }) {
    console.log(new Date(), ' ==> res ', data.method, ' - ', data.code, ' - ', data.path, ' - ', data.message)
  }
}

const Trail = new Logger();
export default Trail