const Movie = require('../model/movie')
const Review = require('../model/review')
const User = require('../model/user')
const { topRatedMoviesPipline, getAverageRating } = require('../utils/helper')

exports.getAppInfo = async (req, res) => {
  const movieCount = await Movie.countDocuments()
  const reviewCount = await Review.countDocuments()
  const userCount = await User.countDocuments()

  res.json({ appInfo: { movieCount, reviewCount, userCount } })
}

exports.getMostRated = async (req, res) => {
  const movies = await Movie.aggregate(topRatedMoviesPipline())

  const mapMovies = async (m) => {
    const reviews = await getAverageRating(m._id)

    return {
      id: m._id,
      title: m.title,
      reviews: { ...reviews },
    }
  }
  const topRatedMovies = await Promise.all(movies.map(mapMovies))

  res.json({ movies: topRatedMovies })
}
