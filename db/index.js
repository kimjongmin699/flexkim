const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()

mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log('Db is connect'))
  .catch((err) => {
    console.log(err)
  })
