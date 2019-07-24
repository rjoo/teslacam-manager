const drivelist = require('drivelist')
const fs = require('fs')
const path = require('path')
const disk = require('diskusage')
const ffprobe = require('ffprobe')
const generateId = require('nanoid/generate')
const Hashids = require('hashids')
const hashids = new Hashids.default()
const { downloadBinaries, detectPlatform } = require('ffbinaries')
const { app } = require('electron')

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
 * @returns {Array} videos
 */
function getVideosFromPath(dirpath) {
  const filenames = fs.readdirSync(dirpath)
  const videos = filenames.map(filename => {
    let { date, timestamp, camera } = parseFilename(filename)
    const filepath = `${dirpath}${path.sep}${filename}`
    const stats = fs.statSync(filepath)
    const size = parseInt(stats.size / 1000000)

    return {
      camera,
      date,
      filepath,
      id: filename,
      timestamp,
      sizeInMegabytes: size
    }
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

const isTeslaCamVideoFilepath = (filepath) => {
  return filepath.includes('TeslaCam') && filepath.endsWith('mp4')
}

/**
 * Scans user's drives to auto-detect TeslaCam directory
 * @todo Multiple drives detection
 */
const scanDrives = () => {
  return new Promise((resolve, reject) => {
    drivelist.list()
      .then(drives => {
        let mnt = ''
        let tcamDir = ''

        drives.forEach(drive => {
          drive.mountpoints.forEach(mountpoint => {
            if (fs.existsSync(path.join(mountpoint.path, 'TeslaCam'))) {
              mnt = mountpoint.path
              tcamDir = path.join(mountpoint.path, 'TeslaCam')
            }
          })
        })

        resolve({
          dir: tcamDir,
          mnt,
          drives
        })
      })
      .catch(err => {
        reject(err)
      })
  })
}

/**
 * Checks free/available space
 * @param {String} path Path to disk to check
 * @returns {Promise}
 */
const checkDiskUsage = (path) => {
  return new Promise((resolve, reject) => {
    disk.check(path)
      .then(info => resolve(info))
      .catch(err => reject(err))
  })
}

/**
 * Deletes videos
 * @param {Array} paths Array of paths {String} to delete
 */
const deleteVideos = (paths = []) => {
  if (!paths.length)
    return Promise.reject(new Error('No video paths provided to delete'))

  for (let i = 0, l = paths.length; i < l; i++) {
    try {
      fs.unlinkSync(paths[i])
    } catch (e) {
      return Promise.reject(e)
    }
  }

  return Promise.resolve()
}

/**
 * Downloads/adds ffprobe/ffmpeg binaries to user's temp folder
 * Retrieves from cache if already detected
 * @returns {Promise}
 */
const getBinaries = () => {
  return new Promise((resolve, reject) => {
    const platform = detectPlatform()
    const ffPaths = {
      ffprobe: '',
      ffmpeg: ''
    };

    downloadBinaries(
      ['ffprobe', 'ffmpeg'],
      { destination: app.getPath('temp') },
      (err, data) => {
        if (err) {
          return reject(err)
        }

        const ffprobe = data.find(d => d.filename === 'ffprobe')
        const ffmpeg = data.find(d => d.filename === 'ffmpeg')

        ffPaths.ffprobe = path.join(
          ffprobe.path,
          ffprobe.filename
        )
        ffPaths.ffmpeg = path.join(
          ffmpeg.path,
          ffmpeg.filename
        )

        resolve(ffPaths)
      })
  })
}

/**
 * Get video data
 * @param {Object} paths Path to ff binaries and teslacam dir
 * @param {String} type 'recent' or 'saved'
 */
const getData = (paths = {}, type = 'recent') => {
  let videosPath = paths.teslaCamDir
  let videos

  if (type === 'recent') {
    videosPath += path.sep + 'RecentClips'
  } else if (type === 'saved') {
    videosPath += path.sep + 'SavedClips'
  }

  if (!fs.existsSync(videosPath))
    return Promise.resolve({})

  if (type === 'recent') {
    videos = getVideosFromPath(videosPath)
  } else if (type === 'saved') {
    videos = []

    const savedDirs = fs.readdirSync(videosPath)
    savedDirs.forEach(savedDir => {
      videos = videos.concat(getVideosFromPath(
        path.join(videosPath, savedDir)
      ))
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
  // const probes = videos.map(video => {
  //   return new Promise((res) => {
  //     ffprobe(video.filepath, { path: paths.ffprobe })
  //       .then(info => {
  //         video.duration = info.streams[0].duration
  //         video.codec = info.streams[0].codec_name
  //         res(video)
  //       })
  //       .catch((e) => {
  //         video.error = true
  //         res(video)
  //       })
  //   })
  // })

  // return Promise.all(probes).then(videos => {
    videos.forEach(video => {
      const idx = videosOutput.findIndex(vo => vo.timestamp === video.timestamp)

      if (idx === -1) {
        videosOutput.push({
          id: type + makeId(video.timestamp),
          sizeInMegabytes: video.sizeInMegabytes,
          timestamp: video.timestamp,
          type,
          videos: [video]
        })
      } else {
        videosOutput[idx].videos.push(video)
        videosOutput[idx].sizeInMegabytes += video.sizeInMegabytes
      }
    })

    return Promise.resolve(videosOutput)
  // })
}

module.exports = {
  checkDiskUsage,
  deleteVideos,
  isTeslaCamVideoFilepath,
  scanDrives,
  getBinaries,
  getData
}