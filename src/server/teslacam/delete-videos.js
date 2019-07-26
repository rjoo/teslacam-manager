import del from 'del'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import { isVideoFilepath } from './util'

const pReaddir = promisify(fs.readdir)
/**
 * Deletes videos
 * @param {Array} obj.paths Array of video filepaths {String} to delete
 * @param {String} obj.type Type of file 'recent' or 'saved'
 * @todo Refactor
 */
export const deleteVideos = ({ paths = [], type = '' }) => {
  // Filter out anything that's not a TeslaCam video file path
  paths = paths.filter(filepath => isVideoFilepath(filepath))

  if (!paths.length)
    return Promise.reject(new Error('No video paths provided to delete'))

  const deletions = []
  let startIdx = 0

  // Delete videos in increments of 200 files at a time
  while (startIdx < paths.length) {
    let pathsToRemove = paths.slice(startIdx, startIdx + 200)

    console.log(`Batch deleting ${pathsToRemove.length} files`)
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

    console.log(`Removing ${dirsToRemove.length} directories`)
    return del(dirsToRemove, { force: true })
  } catch (e) {
    console.error(e)
    return Promise.reject(e)
  }
}