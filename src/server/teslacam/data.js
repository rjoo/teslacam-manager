import fs from 'fs'
import path from 'path'
import Hashids from 'hashids'
import log from 'electron-log'
const hashids = new Hashids()

/**
 * @param {String} filename '2019-06-29_15-29-28-front.mp4'
 * @returns {Object} { date, timestamp, camera }
 */
function parseFilename(filename) {
  filename = filename.substring(0, filename.indexOf('.'))
  let [ date, timeLocation ] = filename.split('_')
  let [ camera ] = timeLocation.match(/[a-zA-Z]+/)
  let time = timeLocation.substring(0, timeLocation.indexOf('-' + camera))
  time = time.replace(/-/g, ':')
  let timestamp = (date + ' ' + time)

  return {
    date,
    timestamp,
    camera
  }
}

/**
 * @param {String} dirpath Path to directory with videos
 * @param {Function} cb Callback applied to each video object before returning
 * @returns {Array} videos
 */
function getVideosFromPath(dirpath, cb) {
  const filenames = fs.readdirSync(dirpath)
  const videos = filenames
    // Get only filenames that have stat and matches the expected pattern
    .filter(filename => {
      const filepath = `${dirpath}${path.sep}${filename}`
      try {
        fs.statSync(filepath)
        parseFilename(filename)
        return true
      } catch (e) {
        return false
      }
    })
    .map(filename => {
      const filepath = `${dirpath}${path.sep}${filename}`
      const stats = fs.statSync(filepath)
      let { date, timestamp, camera } = parseFilename(filename)

      const vid = {
        camera,
        date,
        filepath,
        id: filename,
        timestamp,
        size: stats.size
      }

      return cb ? cb(vid) : vid
    })

  return videos
}

/**
 * Hash ID based on timestamp
 * @param {String} timestamp
 * @returns {String} id
 */
function makeId(timestamp) {
  let toEncode = timestamp.replace(/(-|:)+/g, ' ')
  toEncode = toEncode.split(' ')

  return hashids.encode(toEncode)
}

/**
 * Get video data
 * @param {Object} paths Path to ff binaries and teslacam dir
 * @param {String} type 'recent' or 'saved'
 * @todo Test limits
 */
export const getData = (paths = {}, type = 'recent') => {
  let videosPath = paths.teslaCamDir
  let videos

  if (type === 'recent') {
    videosPath += path.sep + 'RecentClips'
  } else if (type === 'saved') {
    videosPath += path.sep + 'SavedClips'
  }

  if (!fs.existsSync(videosPath))
    return Promise.resolve([])

  if (type === 'recent') {
    videos = getVideosFromPath(videosPath)
  } else if (type === 'saved') {
    videos = []

    // For saved clips, reach into every sub-directory and get videos
    const savedDirs = fs.readdirSync(videosPath)
    savedDirs.forEach(savedDir => {
      let absPath = path.join(videosPath, savedDir)

      if (fs.lstatSync(absPath).isDirectory())
        videos = videos.concat(
          // Add an extra attribute to saved video files for grouping purposes
          getVideosFromPath(absPath, (vid) => {
            vid.groupId = savedDir
            return vid
          })
        )
    })
  }

  const videosOutput = [
    /**
     * {
     *   timestamp: '',
     *   sizeInMegabytes: 0,
     *   videos: []
     * }, { ... }
     */
  ]

  log.info(`Found ${videos.length} ${type} videos`)

  // Set some kind of arbitrary limit for now
  videos = videos.slice(0, 4000)

  videos.sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  ).forEach(video => {
    const idx = videosOutput.findIndex(vo => vo.timestamp === video.timestamp)

    if (idx === -1) {
      videosOutput.push({
        id: type + makeId(video.timestamp),
        groupId: video.groupId,
        size: video.size,
        timestamp: video.timestamp,
        type,
        videos: [video]
      })
    } else {
      videosOutput[idx].videos.push(video)
      videosOutput[idx].size += video.size
    }
  })

  return Promise.resolve(videosOutput)
}
