import { TypeUser } from "../lib/Types/user"
import { ErrorResponse } from "./ErrorBoundary"
import { emailRegex, passwordRegex } from "./regexPatterns"

export const validateUserAuthPayload = (payload: TypeUser) => {
  if (!payload.username) return { error: new ErrorResponse({ code: 400, errorCode: 'INCORRECT_USER_DETAILS', message: 'Payload must contain username' }) }
  if (!payload.email || !emailRegex.test(payload.email)) return { error: new ErrorResponse({ code: 400, errorCode: 'INCORRECT_USER_DETAILS', message: 'Payload must contain email' }) }
  if (!payload.password || passwordRegex.test(payload.password)) return { error: new ErrorResponse({ code: 400, errorCode: 'INCORRECT_USER_DETAILS', message: 'Payload must contain a valid password (alphanumeric)' }) }
  return { error: null }
}
