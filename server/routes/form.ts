import { nanoid } from 'nanoid'
import { renameSync } from 'fs'
import crypto from 'crypto'

import { bearer, devMode, requests } from '../server.js'
import { requests as requestsDB } from '../db.js'
import logger from '../logging.js'

let sessions: { id: string; price: number; timestamp: number }[] = []

//@ts-ignore
export default async function form(req, res) {
  let { type, properties, amount } = req.fields
  const files = req.files
  const auth = req.headers?.authorization?.split(' ')[1]
  // @ts-ignore
  const file = Array.isArray(files) ? files.files[0] : files.file
  const { checksum } = req.headers
  if (typeof checksum !== 'string') {
    logger.http('No auth header. Aborting.')
    res.status(418).end('No auth header.')
    return
  }
  if (!properties) {
    logger.http('No content. Aborting.')
    res.status(418).end('No content.')
    return
  }
  const trust = auth === bearer || verifyIntegrity(properties, checksum)
  if (!trust) {
    logger.http('Checksum did not match. Aborting.')
    res.status(401).end('Source not authenticated.')
    return
  }
  if (file && file.size > 15 * 1024 * 1024) {
    logger.http('File too large. Aborting.')
    res.status(402).end('File too large.')
    return
  }

  try {
    properties = JSON.parse(typeof properties === 'string' ? properties : properties[0])
  } catch (err) {
    res.status(400).end(String(err))
    return
  }
  if (type !== 'NFT' || type !== 'FT')
    if (!properties.name || Object.keys(properties).length > 10) {
      logger.http('No name or too many properties. Aborting.')
      res.status(400).end('No name or too many properties.')
    }
  logger.info('Trusted request received.')
  const session = newSession()
  const request: mintParams = {
    properties,
    type,
    ...session,
    price: session.price * 1_000_000,
    status: 'pending',
    addr: '',
    walletId: devMode ? 'Testnet' : 'Constantin',
    amount: Number(amount) || 1,
  }

  if (file) {
    renameSync('./' + file.path, './tmp/' + session.id + '_' + file.name)
    request.file = './tmp/' + session.id + '_' + file.name
    logger.info('Uploaded file: ' + file)
  }
  requests.push(request)
  const inserted = await requestsDB.insertOne(request)
  logger.info(
    'Added request with id: ' + inserted.insertedId + ' and price ' + request.price + ' to MongoDB'
  )
  res.status(200).json(session)
}

function verifyIntegrity(body: string, sig: string) {
  const hmac = crypto.createHmac('sha512', process.env.FORM_KEY!).update(body).digest('hex')
  return sig === hmac
}

function newSession(): { id: string; price: number; timestamp: number } {
  const id = nanoid()
  const price = Math.round(37000 + Math.random() * 3000) / 10000
  const timestamp = new Date().getTime()
  sessions.push({ id, price, timestamp })
  removeOldSessions()
  return { id, price, timestamp }
}

function removeOldSessions() {
  sessions = sessions.filter((session) => {
    return new Date().getTime() - session.timestamp < 60 * 60
  })
}
