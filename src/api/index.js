const process = require('@electron/remote').process

const baseUrl = `http://localhost:${process.env.SERVER_PORT}`

export const getEndpointUrl = (endpoint) => {
  return `${baseUrl}/${endpoint}`
}
