const express = require('express')
const cors = require('cors')
const path = require('path')
// @todo Will this work on machines with firewalls?
const port = 8002
const tcam = require('./teslacam')
const server = express()
server.use(express.json())
server.use(cors())

server.get('/', (req, res) => {
  res.status(200).send('OK')
})

/**
 * Sends requested teslacam video file
 * @example /video?filepath=
 */
server.get('/video', (req, res) => {
  let filepath = req.query.filepath
  
  if (tcam.isVideoFilepath(filepath))
    res.sendFile(filepath)
  else
    res.status(400).json({
      error: 'Not a TeslaCam video file'
    })
})

/**
 * Downloads or retrieves cached ffmpeg/ffprobe binaries
 */
// server.get('/ffbinaries', async (req, res) => {
//   let paths

//   try {
//     paths = await tcam.getBinaries()
//   } catch (err) {
//     return res.status(500).json({
//       error: err.message
//     })
//   }

//   res.json(paths)
// })

/**
 * Scans user's drives to detect teslacam folder
 */
server.get('/teslacam/scandrives', async (req, res) => {
  let tcamDir

  try {
    tcamDir = await tcam.scan()
  } catch (err) {
    return res.status(500).json({
      error: err.message
    })
  }

  res.json(tcamDir)
})

/**
 * Retrieves disk usage information
 */
server.post('/teslacam/checkstorage', async (req, res) => {
  const { path } = req.body
  let info

  try {
    info = await tcam.checkStorage(path)
  } catch (err) {
    return res.status(500).json({
      error: err.message
    })
  }

  return res.json(info)
})

/**
 * Retrieves recent or saved teslacam videos
 */
server.post('/teslacam/data', async (req, res) => {
  const { paths, type } = req.body
  let data

  try { 
    data = await tcam.getData(paths, type)
  } catch (err) {
    return res.status(500).json({
      error: err.message
    })
  }

  res.json(data)
})

/**
 * Deletes videos and cleans up empty saved directories
 */
server.post('/teslacam/delete', async (req, res) => {
  let message
  let { type, videos } = req.body

  if (!videos.length)
    return res.json()

  try {
    await tcam.deleteVideos({
      paths: videos,
      type,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({
      error: 'Unable to delete all videos. Some videos may have been deleted.'
    })
  }

  if (type === 'saved') {
    try {
      const deletedPaths = await tcam.cleanupSavedDirs(path.dirname(path.resolve(videos[0], '../')))

      console.log(deletedPaths)
    } catch (err) {
      console.error(err)
      message = 'There may be some empty sub-folders in SavedClips'
    }
  }

  message = message || ''
  res.json({ message, success: true })
})

server.listen(port, () => console.log(`Server on process ${process.pid} listening on port ${port}.`))
