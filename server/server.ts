import { renameSync } from 'fs'
import express from 'express'
import formidable from 'express-formidable'
import cors from 'cors'
import { config } from 'dotenv'
import crypto from 'crypto'
import { mint } from './mint.js'
import CardanoCliJs from 'cardanocli-js'
import helmet from 'helmet'
import sendMail from './mail.js'
import logger from './logging.js'
import { mints, requests as requestsDB } from './db.js'
import { checkUTXOs } from './utxos.js'
import { v4 as uuidv4 } from 'uuid'
config()

const devMode = process.env.DEV || false
const shelleyGenesisPath = process.env.GENESIS_PATH!
const port = devMode ? process.env.PORT_TEST! : process.env.PORT!

export const cardano = devMode
  ? new CardanoCliJs({ shelleyGenesisPath, network: 'testnet-magic 1097911063' })
  : new CardanoCliJs({ shelleyGenesisPath })

export const wallet = devMode ? cardano.wallet('Testnet') : cardano.wallet('Constantin')

export let requests: mintParams[] = []

let sessions: { id: string; price: number; timestamp: number }[] = []

requests = await loadRequests()
await checkUTXOs()
const server = express()
server.use(helmet())
server.use(cors())
server.use(formidable({ uploadDir: './tmp' }))

server.get('/', (_, res) => {
  res
    .send(
      '<p>This is the API connected to <a href="https://cardano-nft.de">https://cardano-nft.de</a>.</p>'
    )
    .status(200)
    .end()
})

server.post('/form', async (req, res) => {
  // @ts-ignore
  const params: mintParams = req.fields
  const files = req.files
  // @ts-ignore
  const file = Array.isArray(files) ? files.files[0] : files.file
  const { checksum } = req.headers
  if (typeof checksum !== 'string') {
    logger.http('No auth header. Aborting.')
    res.status(418).end('No auth header.')
    return
  }
  if (!params || !params.id) {
    logger.http('No content. Aborting.')
    res.status(418).end('No content.')
    return
  }
  const trust = devMode || verifyIntegrity(JSON.stringify(params), checksum)
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
  if (!sessions.find((s) => s.id === params.id)) {
    console.log(params.id, params.price)
    logger.http('Session does not exist. Aborting.')
    res.status(403).end('Session does not exist or is expired.')
    return
  }
  if (requests.find((request) => request.id === params.id || request.price === params.price)) {
    logger.http('Request already exists. Aborting.')
    res.status(418).end('Request already exists.')
    return
  }
  logger.info('Trusted request received. ID: ', params.id)

  if (file) {
    renameSync('./' + file.path, './tmp/' + params.id + '_' + file.name)
    params.file = './tmp/' + params.id + '_' + file.name
    logger.info('Uploaded file: ' + params.file)
  }

  // @ts-ignore
  res.status(200).end('Submission successful. Checking for payment.')
  params.price = Math.round(params.price * 1_000_000)
  const request: mintParams = { ...params, status: 'pending', timestamp: Date.now() }
  requests.push(request)
  const inserted = await requestsDB.insertOne(request)
  logger.info('Added request with id: ' + inserted.insertedId + ' to MongoDB')
})

server.get('/new', (_, res) => {
  const id = uuidv4()
  const price = Math.round(25000 + Math.random() * 10000) / 10000
  const timestamp = new Date().getTime()
  sessions.push({ id, price, timestamp })
  removeOldSessions()
  res.status(200).json({ id, price, timestamp }).end()
})

server.get('/status/:id', (req, res) => {
  const id = req.params.id
  const request = requests.find((request) => request.id === id)

  if (!request) {
    res.status(404).end('Request with ID ' + id + ' not found')
    return
  }
  res
    .status(200)
    .json({
      id: id,
      received: true,
      paid: request.paid,
      uploaded: !!request.file,
      minted: request.minted,
      policy: request.policy,
    })
    .end()
})

server.listen(port, () => {
  logger.info('Server running on port ' + port)
})

function verifyIntegrity(body: string, sig: string) {
  const hmac = crypto
    //@ts-ignore
    .createHmac('sha512', process.env.FORM_KEY)
    .update(body)
    .digest('hex')
  return sig === hmac
}

export async function handleMint(req: mintParams) {
  try {
    const minted = await mint(req)
    req.minted = minted.txHash
    req.policy = minted.policy
    updateStatus(req.id, 'minted')
    devMode || sendMail(`Minting of ${req.type} with ID ${req.id} successful!`)
    mints.insertOne({ ...minted.tx, _id: minted.txHash, policy: minted.policy })
  } catch (error) {
    logger.error(error)
    updateStatus(req.id, 'failed')
    devMode || sendMail(`There was an error while minting request ${req.id}:  ${error}`)
  }
}

export function updateStatus(id: string, status: 'pending' | 'paid' | 'minted' | 'failed') {
  requests = requests.map((request) => {
    if (request.id == id) request.status = status
    return request
  })
  requestsDB.updateOne({ id }, { $set: { status } })
}

function removeOldSessions() {
  sessions = sessions.filter((session) => {
    return new Date().getTime() - session.timestamp < 60 * 60
  })
}

async function loadRequests() {
  const pastRequests = await requestsDB
    .find({ status: { $in: ['pending', 'failed'] } })
    .toArray()
    .catch((error) => {
      logger.error(error)
    })
  pastRequests && logger.info('Loaded ' + pastRequests.length + ' past requests')
  return pastRequests || []
}
