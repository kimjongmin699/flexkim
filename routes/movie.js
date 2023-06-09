const express = require('express')
const { isAuth, isAdmin } = require('../middlewares/auth')
const {
  uploadTrailer,
  createMovie,
  updateMovieWithoutPoster,
  updateMovieWithPoster,
  removeMovie,
  getMovies,
  getMovieForUpdate,
  updateMovie,
  searchMovies,
  getLatestUploads,
  getSingleMovie,
  getRelatedMovie,
  getTopRatedMovie,
  searchPublicMovies,
} = require('../controllers/movie')
const { uploadVideo, uploadImage } = require('../middlewares/multer')
const { parseData } = require('../utils/helper')
const {
  validateMovie,
  validate,
  validateTrailer,
} = require('../middlewares/validator')
const router = express.Router()

router.post(
  '/upload-trailer',
  isAuth,

  uploadVideo.single('video'),
  uploadTrailer
)

router.post(
  '/create',
  isAuth,

  uploadImage.single('poster'),
  parseData,
  validateMovie,
  validateTrailer,
  validate,
  createMovie
)

// router.patch(
//   '/update-movie-without-poster/:movieId',
//   isAuth,
//   isAdmin,
//   //parseData,
//   validateMovie,
//   validate,
//   updateMovieWithoutPoster
// )
router.patch(
  '/update/:movieId',
  isAuth,

  uploadImage.single('poster'),
  parseData,
  validateMovie,
  validate,
  updateMovie
)

router.delete('/:movieId', isAuth, isAdmin, removeMovie)
router.get('/movies', isAuth, isAdmin, getMovies)
router.get('/for-update/:movieId', isAuth, isAdmin, getMovieForUpdate)
router.get('/search', isAuth, isAdmin, searchMovies)

//for normal users
router.get('/latest-uploads', getLatestUploads)
router.get('/single/:movieId', getSingleMovie)
//router.get('/related/:movieId', getRelatedMovie)
router.get('/top-rated', getTopRatedMovie)
router.get('/search-public', searchPublicMovies)

module.exports = router
