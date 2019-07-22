const express = require('express')
const cors = require('cors')
const server = express()
// @todo Will this work on machines with firewalls?
const port = 8002
const tcam = require('./teslacam')

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
  
  if (tcam.isTeslaCamVideoFilepath(filepath))
    res.sendFile(filepath)
  else
    res.status(400).json({
      error: 'Not a TeslaCam video file'
    })
})

/**
 * Downloads or retrieves cached ffmpeg/ffprobe binaries
 */
server.get('/ffbinaries', async (req, res) => {
  let paths

  try {
    paths = await tcam.getBinaries()
  } catch (err) {
    return res.status(500).json({
      error: err.message
    })
  }

  res.json(paths)
})

/**
 * Scans user's drives to detect teslacam folder
 */
server.get('/teslacam/scandrives', async (req, res) => {
  let tcamDir

  try {
    tcamDir = await tcam.scanDrives()
  } catch (err) {
    return res.status(500).json({
      error: err.message
    })
  }

  res.json(tcamDir)
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

module.exports = {
  startServer() {
    server.listen(port)
  }
}
