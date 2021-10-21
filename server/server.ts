import { renameSync } from 'fs'
import express, { request } from 'express'
import formidable from 'express-formidable'
import cors from 'cors'
import { config } from 'dotenv'
import crypto from 'crypto'
import { mint } from './mint.js'
import CardanoCliJs from 'cardanocli-js'
import { BlockFrostAPI } from '@blockfrost/blockfrost-js'
import { mintParams } from './mint'
import helmet from 'helmet'
import winston from 'winston'
import LokiTransport from 'winston-loki'
import { MongoClient } from 'mongodb'
config()

interface receivedPayment {
  amount: number
  payer: string
}

const options = {
  level: 'verbose',
  format: winston.format.json(),
  defaultMeta: { service: 'API' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'combined.log' }),
    new LokiTransport({
      //@ts-ignore
      host: process.env.GRAPHANA,
    }),
  ],
}
export const logger = winston.createLogger(options)

const blockFrostApiKey = process.env.BLOCKFROST_API_KEY_MAINNET || ''
const blockfrost = new BlockFrostAPI({
  projectId: blockFrostApiKey,
})

const shelleyGenesisPath = process.env.GENESIS_PATH || ''
const cardano = new CardanoCliJs({ shelleyGenesisPath })

const wallet = cardano.wallet('Constantin')

// @ts-ignore
const mongodb = new MongoClient(process.env.MONGODB_URI)
await mongodb.connect()
const db = mongodb.db()
const requests = db.collection<mintParams>('requests')
const mints = db.collection<mintParams>('mints')

let utxos = []
let receivedPayments: receivedPayment[] = []
let openRequests: mintParams[] = []

async function checkUTXOs() {
  utxos = cardano.queryUtxo('addr1v9wn4hy9vhpggjznklav6pp4wtk3ldkktfp5m2ja36zv4sshsepsj').reverse()
  logger.log({
    level: 'verbose',
    message:
      utxos.length +
      ' open UTXOs' +
      ' + ' +
      receivedPayments.length +
      ' open Payments' +
      ' + ' +
      openRequests.length +
      ' open Requests',
    utxos: utxos.length,
    payments: receivedPayments.length,
    requests: openRequests.length,
    type: 'status',
  })

  if (receivedPayments.length < utxos.length) {
    try {
      const payment = await payerAddr(utxos[receivedPayments.length].txHash)
      receivedPayments.push(payment)
      checkPayment(receivedPayments, openRequests)
      checkUTXOs()
    } catch (error) {
      logger.error(error)
      checkUTXOs()
    }
  } else {
    await new Promise((resolve) => setTimeout(resolve, 10000))
    checkPayment(receivedPayments, openRequests)
    checkUTXOs()
  }
}
checkUTXOs()
const server = express()
server.use(helmet())
server.use(cors())
server.use(formidable({ uploadDir: './tmp' }))
const port = process.env.PORT

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
  const trust = req.fields && verifyIntegrity(JSON.stringify(params), checksum)
  if (!trust) {
    logger.http('Checksum did not match. Aborting.')
    res.status(401).end('Source not authenticated.')
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
  params.price = params.price * 1_000_000
  params.paid ? mint(params) : openRequests.push(params)
  const _id = await requests.insertOne(params)
  logger.info('Added request with id: ' + _id + ' to MongoDB')
  logger.info({ message: 'Currently open requests: ', requests: openRequests })
})

server.get('/status/:id', (req, res) => {
  const id = req.params.id
  const request = openRequests.find((request) => request.id === id)
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
    })
    .end()
})

server.listen(port, () => {
  logger.info('Server running on port ' + port)
})
interface Request {
  body: string
  headers: { checksum: string }
}

function verifyIntegrity(body: string, sig: string) {
  const hmac = crypto
    //@ts-ignore
    .createHmac('sha512', process.env.FORM_KEY)
    .update(body)
    .digest('hex')
  // sig !== hmac && console.log(hmac)
  return sig === hmac
}

async function payerAddr(txHash: string) {
  let info = {
    amount: 0,
    payer: '',
  }
  const tx = await blockfrost.txsUtxos(txHash)
  tx.outputs.forEach((output) => {
    if (output.address === wallet.paymentAddr) {
      info.amount = Number.parseFloat(
        //@ts-ignore
        output.amount.find((a) => a.unit === 'lovelace').quantity
      )
      info.payer = tx.inputs[0].address
    }
  })
  return info
}

function checkPayment(payments: receivedPayment[], requests: mintParams[]) {
  for (const payment of payments) {
    for (const [i, req] of requests.entries()) {
      if (req.price === payment.amount) {
        logger.info({
          message: 'Found match for incoming payment',
          type: 'match',
          request: req.id,
          addres: payment.payer,
        })
        req.addr = payment.payer
        mint(req)
        requests.splice(i, 1)
      }
    }
  }
}
