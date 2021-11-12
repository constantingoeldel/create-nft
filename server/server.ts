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
import { mints, requests } from './db.js'
import { checkUTXOs } from './utxos.js'
config()

const devMode = process.env.DEV || false
const shelleyGenesisPath = process.env.GENESIS_PATH!

export const cardano = devMode
  ? new CardanoCliJs({ shelleyGenesisPath, network: 'testnet-magic 1097911063' })
  : new CardanoCliJs({ shelleyGenesisPath })

export const wallet = devMode ? cardano.wallet('Testnet') : cardano.wallet('Constantin')

export let receivedPayments: receivedPayment[] = []
export let openRequests: mintParams[] = []
export let paidRequests: mintParams[] = []
export let successfulRequests: mintParams[] = []

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
  if (openRequests.find((request) => request.id === params.id || request.price === params.price)) {
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
  params.paid ? mint(params) : openRequests.push(params)
  const inserted = await requests.insertOne(params)
  logger.info('Added request with id: ' + inserted.insertedId + ' to MongoDB')
  logger.info({ message: 'Currently open requests: ', requests: openRequests })
})

server.get('/status/:id', (req, res) => {
  const id = req.params.id
  const request =
    openRequests.find((request) => request.id === id) ||
    successfulRequests.find((request) => request.id === id) ||
    paidRequests.find((request) => request.id === id)
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
  sig !== hmac && devMode && console.log(hmac)
  return devMode || sig === hmac
}

export async function handleMint(req: mintParams) {
  try {
    const minted = await mint(req)
    receivedPayments = []
    checkUTXOs()
    req.minted = minted.txHash
    req.policy = minted.policy
    successfulRequests.push(req)
    paidRequests = paidRequests.filter((request) => request.id !== req.id)
    devMode || sendMail(`Minting of ${req.type} with ID ${req.id} successful!`)
    mints.insertOne({ ...minted.tx, _id: minted.txHash, policy: minted.policy })
  } catch (error) {
    logger.error(error)
    devMode || sendMail(`There was an error while minting request ${req.id}:  ${error}`)
  }
}
