const drivelist = require('drivelist')
const fs = require('fs')
const path = require('path')
const disk = require('diskusage')
const ffprobe = require('ffprobe')
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

  const videosMap = {}
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
      if (!videosMap[video.timestamp]) {
        videosMap[video.timestamp] = {
          videos: [],
          duration: video.duration,
          sizeInMegabytes: video.sizeInMegabytes
        }
      } else {
        videosMap[video.timestamp].sizeInMegabytes += video.sizeInMegabytes
      }

      videosMap[video.timestamp].videos.push(video)
    })

    return Promise.resolve(videosMap)
  // })
}

module.exports = {
  checkDiskUsage,
  isTeslaCamVideoFilepath,
  scanDrives,
  getBinaries,
  getData
}