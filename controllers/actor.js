const { isValidObjectId } = require('mongoose')
const Actor = require('../model/actor')
var cloudinary = require('cloudinary').v2
const dotenv = require('dotenv')
const { formatActor, sendError } = require('../utils/helper')
dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
  secure: true,
})

exports.createActor = async (req, res) => {
  const { name, about, gender } = req.body
  const { file } = req

  const newActor = new Actor({ name, about, gender })

  if (file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      file.path,
      { gravity: 'face', height: 500, widht: 500, crop: 'thumb' }
    )
    newActor.avatar = { url: secure_url, public_id }
  }
  await newActor.save()

  res.status(201).json({
    actor: {
      id: newActor._id,
      name,
      about,
      gender,
      avatar: newActor.avatar?.url,
    },
  })
}

exports.updateActor = async (req, res) => {
  const { name, about, gender } = req.body
  const { file } = req
  const { actorId } = req.params

  if (!isValidObjectId(actorId)) return res.json({ error: 'Invalid Id' })
  const actor = await Actor.findById(actorId)
  if (!actor) return res.json({ error: 'Could not find Actor' })

  const public_id = actor.avatar?.public_id

  if (public_id && file) {
    const { result } = await cloudinary.uploader.destroy(public_id)
    if (result !== 'ok') {
      return res.json({ error: 'Could not remove imgage' })
    }
  }
  if (file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      file.path,
      { gravity: 'face', height: 500, widht: 500, crop: 'thumb' }
    )
    actor.avatar = { url: secure_url, public_id }
  }
  actor.name = name
  actor.about = about
  actor.gender = gender

  await actor.save()

  res.status(201).json({
    actor: {
      id: actor._id,
      name: actor.name,
      about: actor.about,
      gender: actor.gender,
      avatar: actor.avatar?.url,
    },
  })
}

exports.removeActor = async (req, res) => {
  const { actorId } = req.params
  console.log(actorId)

  if (!isValidObjectId(actorId)) return res.json({ error: 'Invalid Id' })
  const actor = await Actor.findById(actorId)
  if (!actor) return res.json({ error: 'Could not find Actor' })

  const public_id = actor.avatar?.public_id

  if (public_id) {
    const { result } = await cloudinary.uploader.destroy(public_id)
    if (result !== 'ok') {
      return res.json({ error: 'Could not remove imgage' })
    }
  }

  await Actor.findByIdAndDelete(actorId)

  res.json({ message: 'User removed. Successfully' })
}

exports.searchActor = async (req, res) => {
  const { name } = req.query
  console.log(name)
  //const result = await Actor.find({ $text: { $search: `"${name}"` } })

  if (!name.trim()) return sendError(res, 'Invalid request!')
  const result = await Actor.find({
    name: { $regex: name, $options: 'i' },
  })
  const actors = result.map((actor) => formatActor(actor))
  console.log(result)
  res.json({ results: actors })
}

exports.getLatestActor = async (req, res) => {
  const result = await Actor.find().sort({ createdAt: '1' }).limit(12)
  const actors = result.map((actor) => formatActor(actor))
  res.json(actors)
}

exports.getSingleActor = async (req, res) => {
  const { id } = req.params
  if (!isValidObjectId(id)) return res.json({ error: 'Invalid Id' })

  const actor = await Actor.findById(id)
  if (!actor) return res.json({ error: 'actor not found!!' })

  res.json({ actor: formatActor(actor) })
}

exports.getActor = async (req, res) => {
  const { pageNo, limit } = req.query

  const actors = await Actor.find({})
    .sort({ createdAt: -1 })
    .skip(parseInt(pageNo) * parseInt(limit))
    .limit(parseInt(limit))

  const profiles = actors.map((actor) => formatActor(actor))

  res.json({
    profiles,
  })
}
