export const isVideoFilepath = (filepath) => {
  return filepath.includes('TeslaCam') && filepath.endsWith('mp4')
}
