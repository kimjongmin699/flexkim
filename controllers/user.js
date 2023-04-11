const User = require('../model/user')
const EmailVerificationToken = require('../model/emailVerificationToken')
const PasswordResetToken = require('../model/passwordResetToken')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { isValidObjectId } = require('mongoose')
const { generateMailTransporter, generateOTP } = require('../utils/mail')
const { sendError, generateRandomByte } = require('../utils/helper')
const dotenv = require('dotenv')
dotenv.config()

exports.createUser = async (req, res) => {
  const { name, email, password } = req.body
  console.log(req.body)

  const oldUser = await User.findOne({ email })

  if (oldUser) return res.json({ error: 'Email exist' })

  const newUser = new User({ name, email, password })
  await newUser.save()

  // generate 6 digit otp
  let OTP = generateOTP()

  // store otp inside our db
  const newEmailVerificationToken = new EmailVerificationToken({
    owner: newUser._id,
    token: OTP,
  })

  await newEmailVerificationToken.save()

  //send that otp to your email
  var transport = generateMailTransporter()

  transport.sendMail({
    fron: 'verification@movie.com',
    to: newUser.email,
    subject: 'Email verification',
    html: `<p>YOur verifivcairon OTP</p>
      <h1>${OTP}</h1>
    `,
  })

  res.json({
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    },
  })
}

exports.verifyEmail = async (req, res) => {
  const { userId, OTP } = req.body

  if (!isValidObjectId(userId)) return res.json({ error: 'Invalid user!' })

  const user = await User.findById(userId)
  if (!user) return res.json({ error: 'user not found!' })
  if (user.isVerified) return res.json({ error: 'user is already verified!' })

  const token = await EmailVerificationToken.findOne({ owner: userId })
  console.log(token)
  if (!token) return res.json({ error: 'token not found!' })

  const isMatched = await token.compareToken(OTP)
  if (!isMatched) return res.json({ error: 'Please submit a valid OTP!' })

  user.isVerified = true
  await user.save()

  await EmailVerificationToken.findByIdAndDelete(token._id)
  var transport = generateMailTransporter()
  transport.sendMail({
    fron: 'verification@movie.com',
    to: user.email,
    subject: 'Email verification',
    html: `<p>YOur verifivcairon OTP</p>
      <h1>Welcome Moveie App</h1>
    `,
  })
  const jwtToken = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
    expiresIn: '7d',
  })
  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      token: jwtToken,
      isVerified: user.isVerified,
      role: user.role,
    },
    message: 'Your email is verified',
  })
}

exports.resendEmailVerificationToken = async (req, res) => {
  const { userId } = req.body

  const user = await User.findById(userId)
  if (!user) return res.json({ error: 'User not FOund' })

  if (user.isVerified)
    return res.json({ error: 'This email is already verified' })

  const alreadyHasToken = await EmailVerificationToken.findOne({
    owner: userId,
  })
  if (alreadyHasToken) return res.json({ error: 'Only after one for ' })

  // generate 6 digit otp
  let OTP = generateOTP()

  // store otp inside our db
  const newEmailVerificationToken = new EmailVerificationToken({
    owner: user._id,
    token: OTP,
  })

  await newEmailVerificationToken.save()

  var transport = generateMailTransporter()

  transport.sendMail({
    fron: 'verification@movie.com',
    to: user.email,
    subject: 'Email verification',
    html: `<p>YOur verifivcairon OTP</p>
      <h1>${OTP}</h1>
    `,
  })
  res.json({ message: 'New OTP send your email' })
}

exports.forgetPassword = async (req, res) => {
  const { email } = req.body
  console.log(email)
  if (!email) return sendError(res, 'Email is missing')

  const user = await User.findOne({ email })
  if (!user) return sendError(res, 'User Not found', 404)

  const alreadyHasToken = await PasswordResetToken.findOne({ owner: user._id })
  if (alreadyHasToken) return sendError(res, 'Token is exist')

  const token = await generateRandomByte()
  const newPasswordResetToken = await PasswordResetToken({
    owner: user._id,
    token,
  })
  await newPasswordResetToken.save()

  const resetPasswordUrl = `http://localhost:3000/auth/reset-password?token=${token}&id=${user._id}`

  var transport = generateMailTransporter()
  transport.sendMail({
    fron: 'security@movie.com',
    to: user.email,
    subject: 'Reset Password Link',
    html: `<p>Click here to reset password</p>
      <a href='${resetPasswordUrl}'>Change Password</a>
    `,
  })
  res.json({ message: 'Link send to your email' })
}

exports.sendResetPasswordTokenStatus = (req, res) => {
  res.json({ valid: true })
}

exports.resetPassword = async (req, res) => {
  const { newPassword, userId } = req.body

  const user = await User.findById(userId)
  const matched = await user.comparePassword(newPassword)
  if (matched) return res.json({ error: 'This password is march old password' })

  user.password = newPassword
  await user.save()

  await PasswordResetToken.findByIdAndDelete(req.resetToken._id)

  const transport = generateMailTransporter()

  transport.sendMail({
    fron: 'security@movie.com',
    to: user.email,
    subject: 'Password Reset Successfully',
    html: `
    <h1>Password Reset Successfully</h1>
    <p>Now you can use new Password</p>
    `,
  })
  res.json({ message: 'Password Reset Successfully' })
}

exports.signIn = async (req, res) => {
  const { email, password } = req.body
  console.log(req.body)

  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ error: 'User not exist' })
    }

    const matched = await user.comparePassword(password)
    if (!matched) return res.json({ error: 'Password Wrong' })

    const { _id, name, isVerified, role } = user

    const jwtToken = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: '30d',
    })

    res.json({
      user: { id: _id, name, email, role, token: jwtToken },
    })
  } catch (error) {
    console.log(error)
    next(error.message)
  }
}
