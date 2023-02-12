const CustomAPIError = require('./custom-error')
const { StatusCodes } = require('http-status-codes')
class notfound extends CustomAPIError {
  constructor(message) {
    super(`{success:false, msg:${message}}`)
    this.statusCode = StatusCodes.NOT_FOUND
  }
}

module.exports = notfound
