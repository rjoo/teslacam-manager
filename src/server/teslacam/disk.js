const drivelist = require('drivelist')
const fs = require('fs')
const path = require('path')
const disk = require('diskusage')

/**
 * Scans user's drives to auto-detect TeslaCam directory
 * @todo Multiple drives detection
 */
export const scan = () => {
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
 * @param {String} mnt Path to disk to check
 * @returns {Promise}
 */
export const checkStorage = (mnt) => {
  return new Promise((resolve, reject) => {
    disk.check(mnt)
      .then(info => resolve(info))
      .catch(err => reject(err))
  })
}
