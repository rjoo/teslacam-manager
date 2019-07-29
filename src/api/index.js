import { remote } from 'electron'

const baseUrl = `http://localhost:${remote.process.env.SERVER_PORT}`

export const getEndpointUrl = (endpoint) => {
  return `${baseUrl}/${endpoint}`
}
