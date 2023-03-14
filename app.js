const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const userRouter = require('./routes/user')
const actorRouter = require('./routes/actor')
const movieRouter = require('./routes/movie')
const reviewRouter = require('./routes/review')
const adminRouter = require('./routes/admin')
const db = require('./db')
require('express-async-errors')
const dotenv = require('dotenv')
const { handleNotFound } = require('./utils/helper')
dotenv.config()

const app = express()
app.use(morgan('dev'))
app.use(express.json())
app.use(cors())
app.use('/api/user', userRouter)
app.use('/api/actor', actorRouter)
app.use('/api/movie', movieRouter)
app.use('/api/review', reviewRouter)
app.use('/api/admin', adminRouter)

app.use('/*', handleNotFound)

app.use((err, req, res, next) => {
  //try-catch를 사용안하고서도 err다 잡아냄.
  console.log('err', err)
  res.status(500).json({ error: err.message || err })
})

app.listen(8000, () => {
  console.log('server is running')
})
