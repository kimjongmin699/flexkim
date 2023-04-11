const crypto = require('crypto')
const Review = require('../model/review')

exports.sendError = (res, error, statusCode = 401) => {
  res.status(statusCode).json({ error })
}

exports.generateRandomByte = () => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(30, (err, buff) => {
      if (err) return console.log(err)
      const buffString = buff.toString('hex')

      console.log(buffString)
      resolve(buffString)
    })
  })
}

exports.handleNotFound = (req, res) => {
  this.sendError(res, 'Not Founde', 404)
}

exports.uploadImageToCloud = async (file) => {
  const { secure_url: url, public_id } = await cloudinary.uploader.upload(
    file,
    {
      gravity: 'face',
      height: 500,
      widht: 500,
      crop: 'thump',
    }
  )

  return { url, public_id }
}

exports.formatActor = (actor) => {
  const { name, gender, about, _id, avatar } = actor

  return {
    id: _id,
    name,
    about,
    gender,
    avatar: avatar?.url,
  }
}

exports.parseData = (req, res, next) => {
  const { trailer, cast, genres, writers } = req.body

  if (trailer) req.body.trailer = JSON.parse(trailer)
  if (cast) req.body.cast = JSON.parse(cast)
  if (genres) req.body.genres = JSON.parse(genres)
  if (writers) req.body.writers = JSON.parse(writers)

  next()
}

exports.averageRatingPipeline = (movieId) => {
  return [
    {
      $lookup: {
        from: 'Review',
        localField: 'rating',
        foreignField: '_id',
        as: 'avgRat',
      },
    },
    {
      $match: { parentMovie: movieId },
    },
    {
      $group: {
        _id: null,
        ratingAvg: {
          $avg: '$rating',
        },
        reviewCount: {
          $sum: 1,
        },
      },
    },
  ]
}

exports.relatedMovieAggregation = (movieId) => {
  return [
    {
      $lookup: {
        from: 'Movie',
        foreignField: '_id',
        as: 'relatedMovies',
      },
    },

    {
      $project: {
        title: 1,
        poster: '$poster.url',
        responsivePoster: '$poster.responsive',
      },
    },
    {
      $limit: 5,
    },
  ]
}

exports.getAverageRating = async (movieId) => {
  const [aggregatedResponse] = await Review.aggregate(
    this.averageRatingPipeline(movieId)
  )
  const reviews = {}

  if (aggregatedResponse) {
    const { ratingAvg, reviewCount } = aggregatedResponse
    reviews.rating = parseInt(ratingAvg).toFixed(1)
    reviews.reviewCount = reviewCount
  }

  return reviews
}

exports.topRatedMoviesPipline = (type) => {
  const matchOptions = {
    reviews: { $exists: true },
    status: { $eq: 'public' },
  }
  if (type) matchOptions.type = { $eq: type }

  return [
    {
      $lookup: {
        from: 'Movie',
        localField: 'review',
        foreignField: '_id',
        as: 'topRated',
      },
    },
    {
      $match: matchOptions,
    },
    {
      $project: {
        title: 1,
        poster: '$poster.url',
        responsivePoster: '$poster.responsive',
        reviewCount: { $size: '$reviews' },
      },
    },
    {
      $sort: {
        reviewCount: -1,
      },
    },
    {
      $limit: 7,
    },
  ]
}
