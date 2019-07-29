import { list as drivelist } from 'drivelist'
import fs from 'fs'
import path from 'path'
import disk from 'diskusage'
import log from 'electron-log'

/**
 * Scans user's drives to auto-detect TeslaCam directory
 * @todo Multiple drives detection
 */
export const scan = () => {
  return new Promise((resolve, reject) => {
    drivelist()
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
        log.error(err.message)
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
      .catch(err => {
        log.error(err)
        reject(err)
      })
  })
}
