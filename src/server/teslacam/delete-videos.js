import del from 'del'
import fs from 'fs'
import path from 'path'
import log from 'electron-log'
import { isVideoFilepath } from './util'

/**
 * Deletes videos
 * @param {Array} obj.paths Array of video filepaths {String} to delete
 */
export const deleteVideos = ({ paths = [] }) => {
  // Filter out anything that's not a TeslaCam video file path
  paths = paths.filter(filepath => isVideoFilepath(filepath))

  if (!paths.length)
    return Promise.reject(new Error('No video paths provided to delete'))

  const deletions = []
  let startIdx = 0

  // Delete videos in increments of 200 files at a time
  while (startIdx < paths.length) {
    let pathsToRemove = paths.slice(startIdx, startIdx + 200)

    log.info(`Batch deleting ${pathsToRemove.length} files`)
    deletions.push(del(pathsToRemove, { force: true }))
    startIdx += 200
  }

  return Promise.all(deletions)
}

/**
 * Checks SavedClips sub-directories and removes empty dirs
 * @param {String} savedPath eg. G:/TeslaCam/SavedClips
 */
export const cleanupSavedDirs = (savedPath = '') => {
  if (!savedPath || !savedPath.includes('SavedClips'))
    return Promise.reject('No path provided to check')

  try {
    const dirs = fs.readdirSync(savedPath)
    const dirsToRemove = []

    dirs.forEach(dir => {
      const fullpath = path.join(savedPath, dir)

      if (!fs.lstatSync(fullpath).isDirectory())
        return

      let files = fs.readdirSync(fullpath)

      if (!files.length)
        dirsToRemove.push(fullpath)
    })

    if (!dirsToRemove.length)
      return Promise.resolve()

    log.info(`Removing ${dirsToRemove.length} directories`)
    return del(dirsToRemove, { force: true })
  } catch (e) {
    log.error(e.message)
    return Promise.reject(e)
  }
}