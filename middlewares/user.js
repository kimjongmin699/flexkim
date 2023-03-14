const { isValidObjectId } = require('mongoose')
const PasswordResetToken = require('../model/passwordResetToken')
const { sendError } = require('../utils/helper')

exports.isValidPassResetToken = async (req, res, next) => {
  const { token, userId } = req.body

  if (!token || !isValidObjectId(userId))
    return sendError(res, 'Invalid userId')

  const resetToken = await PasswordResetToken.findOne({ owner: userId })
  if (!resetToken) return sendError(res, 'Invalid request!!, token')

  const matched = resetToken.compareToken(token)
  if (!matched) return sendError(res, 'Unauthorized access, Invalid request')

  req.resetToken = resetToken
  next()
}
