import logger from './logging.js'
import { start } from './server.js'

export const devMode = !!process.env.DEV || false
logger.info('Starting up')
start()
