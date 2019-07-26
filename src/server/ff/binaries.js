const path = require('path')
const { downloadBinaries } = require('ffbinaries')
const { app } = require('electron')

/**
 * Downloads/adds ffprobe/ffmpeg binaries to user's temp folder
 * Retrieves from cache if already detected
 * @returns {Promise}
 */
export const getBinaries = () => {
  return new Promise((resolve, reject) => {
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
