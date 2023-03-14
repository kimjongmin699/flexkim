const jwt = require('jsonwebtoken')
const User = require('../model/user')

exports.isAuth = async (req, res, next) => {
  const token = req.headers?.authorization

  if (!token) return res.status(404).json({ error: 'Token not found' })

  const jwtToken = token.split('Bearer ')[1]

  if (!jwtToken) return res.status(404).json({ error: 'InvalidToken' })
  const decode = jwt.verify(jwtToken, process.env.SECRET_KEY)
  const { userId } = decode

  const user = await User.findById(userId)
  if (!user) return res.status(404).json({ error: 'User not found' })

  //res.json({ user: { id: user._id, name: user.name, email: user.email } })
  req.user = user
  next()
}

exports.isAdmin = async (req, res, next) => {
  const { user } = req

  if (user.role !== 'admin')
    return res.json({ error: 'unAuthorization not access' })

  next()
}
