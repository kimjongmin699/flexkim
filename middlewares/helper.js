exports.parseData = (req, res, next) => {
  const { trailer, cast, genres,  writers } = req.body

  if (trailer) req.body.trailer = JSON.parse(trailer)
  if (cast) req.body.cast = JSON.parse(cast)
  if (genres) req.body.genres = JSON.parse(genres)
  if (writers) req.body.writers = JSON.parse(writers)

  next()
}
