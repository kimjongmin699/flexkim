const {
  addReview,
  updateReview,
  removeReview,
  getReviewsByMovie,
} = require('../controllers/review')
const { isAuth } = require('../middlewares/auth')
const { validateRating, validate } = require('../middlewares/validator')

const router = require('express').Router()

router.post('/add/:movieId', isAuth, validateRating, validate, addReview)
router.patch('/:reviewId', isAuth, validateRating, validate, updateReview)
router.delete('/:reviewId', isAuth, removeReview)
router.get('/get-reviews-by-movie/:movieId', getReviewsByMovie)

module.exports = router
