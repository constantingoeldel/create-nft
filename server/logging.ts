import winston from 'winston'
import LokiTransport from 'winston-loki'

const logOptions = {
  level: 'verbose',
  format: winston.format.json(),
  defaultMeta: { service: 'API' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'combined.log' }),
    new LokiTransport({
      host: process.env.GRAPHANA!,
    }),
  ],
}
const logger = winston.createLogger(logOptions)

export default logger
