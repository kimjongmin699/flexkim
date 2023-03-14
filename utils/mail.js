const nodemailer = require('nodemailer')

exports.generateOTP = () => {
  let OTP = ''
  for (let i = 1; i <= 6; i++) {
    const randomVal = Math.round(Math.random() * 9)
    OTP += randomVal
  }
  return OTP
}

exports.generateMailTransporter = () =>
  nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: '7534be89a421a0',
      pass: '544a61af07cb7d',
    },
  })
