const CustomAPIError = require('./custom-error')
const { StatusCodes } = require('http-status-codes')
class BadRequest extends CustomAPIError {
  constructor(message) {
    super(`{success:false, msg:${message}}`)
    this.statusCode = StatusCodes.UNAUTHORIZED
  }
}

module.exports = BadRequest
