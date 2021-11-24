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
import { customers, mints, requests as requestsDB } from './db.js'
import { checkUTXOs } from './utxos.js'
import { nanoid } from 'nanoid'
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

try {
  init()
} catch (error) {
  logger.error(error)
  init()
}

async function init() {
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
    res.status(200).end('Submission successful. Checking for payment.')
    params.price = Math.round(params.price * 1_000_000)
    params.amount = Number(params.amount)
    // @ts-ignore
    params.properties = JSON.parse(params.properties)
    const request: mintParams = { ...params, status: 'pending', timestamp: Date.now() }
    requests.push(request)
    const inserted = await requestsDB.insertOne(request)
    logger.info('Added request with id: ' + inserted.insertedId + ' to MongoDB')
  })

  server.get('/new', (_, res) => {
    const id = nanoid()
    const price = Math.round(25000 + Math.random() * 10000) / 10000
    const timestamp = new Date().getTime()
    sessions.push({ id, price, timestamp })
    removeOldSessions()
    res.status(200).json({ id, price, timestamp }).end()
  })

  server.get('/status/:id', (req, res) => {
    const id = req.params.id
    if (id === 'server') {
      res.status(200).end('All systems nominal')
      return
    }
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

  server.get('/v0/', (_, res) => {
    res
      .status(200)
      .end(
        'This is the programmatic API to create NFTs and Native Tokens on the Cardano blockchain. See the documentation here: https://cardano-nft.de/docs '
      )
  })
  server.get('/v0/new', (_, res) => {
    const id = nanoid()
    const wallet = cardano.addressKeyGen(id)
    console.log(wallet)
    cardano.addressBuild(id, { paymentVkey: wallet.vkey })
    const paymentAddr: string = cardano.wallet(id).paymentAddr
    const token = nanoid()
    const createdAt = Date.now()

    customers.insertOne({ id, paymentAddr, token, createdAt })
    logger.log({ message: 'Created new customer: ' + id, level: 'info' })
    res.status(200).json({ paymentAddr, token }).end()
  })

  server.post('/v0/create/:type', async (req, res) => {
    // @ts-ignore
    const request: request = req.fields
    if (!request) {
      res.status(400).end('No request provided')
      return
    }
    const customer = await customers.findOne({ token: request.auth })
    if (!customer) {
      logger.info('Customer not found')
      res.status(401).end('Not authenticated')
      return
    }
    console.log(req.params.type)
    const correctType = req.params.type === 'nft' || req.params.type === 'native'
    if (!correctType) {
      logger.info('Invalid type')
      res.status(400).end('Not a valid token type')
      return
    }
    // @ts-ignore
    const type: 'nft' | 'token' = req.params.type
    request.amount = type === 'token' ? request.amount : 1
    if (!request.amount) {
      logger.info('No amount specified')
      res.status(400).end('No amount specified')
      return
    }
    const customerWallet = cardano.wallet(customer.id)
    const sufficientBalance: boolean = customerWallet.balance().value.lovelace > 2_000_000
    if (!sufficientBalance) {
      logger.info('Insufficient balance')
      res
        .status(402)
        .end(
          'Wallet balance not sufficient, please top up this address: ' + customerWallet.paymentAddr
        )
      return
    }
    const id = nanoid()
    const params: mintParams = {
      id,
      type: type === 'token' ? 'FT' : 'NFT',
      amount: type === 'token' ? request.amount : 1,
      timestamp: Date.now(),
      properties: request.properties,
      paid: true,
      status: 'pending',
      minted: false,
      addr: customerWallet.paymentAddr,
      price: 2_000_000,
    }
    logger.info('Received new API request: ' + JSON.stringify(params))
    await requestsDB.insertOne(params)
    const minted = await handleMint(params)
    res.status(200).json(minted).end()
  })

  server.listen(port, () => {
    logger.info('Server running on port ' + port)
  })
}
function verifyIntegrity(body: string, sig: string) {
  const hmac = crypto.createHmac('sha512', process.env.FORM_KEY!).update(body).digest('hex')
  return /*sig === hmac*/ true
}

export async function handleMint(req: mintParams) {
  try {
    logger.info('Handling mint request: ')
    const minted = await mint(req)
    req.minted = minted.txHash
    req.policy = minted.policy
    updateStatus(req.id, 'minted')
    devMode || sendMail(`Minting of ${req.type} with ID ${req.id} successful!`)
    mints.insertOne({ ...minted.tx, _id: minted.txHash, policy: minted.policy })
    return req
  } catch (error) {
    logger.error(error)
    updateStatus(req.id, 'failed')
    devMode || sendMail(`There was an error while minting request ${req.id}:  ${error}`)
    return { error: 'There was an error when minting: ' + error }
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
    .find({ status: { $in: ['pending', 'failed', 'paid'] } })
    .toArray()
    .catch((error) => {
      logger.error(error)
    })
  pastRequests && logger.info('Loaded ' + pastRequests.length + ' past requests')
  return pastRequests || []
}
