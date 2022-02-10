import express from 'express'
import formidable from 'express-formidable'
import cors from 'cors'
import { config } from 'dotenv'
import { mint } from './mint.js'
import CardanoCliJs from 'cardanocli-js'
import helmet from 'helmet'
import sendMail from './mail.js'
import logger from './logging.js'
import { updateStatus, mints, requests as requestsDB } from './db.js'
import { checkUTXOs } from './utxos.js'
import startChain from './chain.js'
import form from './routes/form.js'
import status from './routes/status.js'
import create from './routes/create.js'
import newCustomer from './routes/newCustomer.js'
import { api, root } from './routes/root.js'
import balance from './routes/balance.js'
config()

export const devMode = process.env.DEV || false
export const bearer = process.env.BEARER_TOKEN!
const shelleyGenesisPath = process.env.GENESIS_PATH!
const port = devMode ? process.env.PORT_TEST! : process.env.PORT!

export const cardano = devMode
  ? new CardanoCliJs({ shelleyGenesisPath, network: 'testnet-magic 1097911063' })
  : new CardanoCliJs({ shelleyGenesisPath })

export const wallet = devMode ? cardano.wallet('Testnet') : cardano.wallet('Constantin')

export let requests: mintParams[] = []

export const start = () => {
  try {
    server()
  } catch (error) {
    logger.error(error)
    server()
  }
}

export async function server() {
  await startChain({ log: false })
  requests = await loadRequests()
  await checkUTXOs()

  const server = express()
  server.use(helmet())
  server.use(cors())
  server.use(formidable({ uploadDir: './tmp' }))

  server.get('/', root)
  server.get('/status/:id', status)
  server.post('/form', form)

  server.get('/v0/', api)
  server.get('/v0/new', newCustomer)
  server.get('/v0/balance/:token', balance)
  server.post('/v0/create/:type', create)

  server.listen(port, () => {
    logger.info('Server running on port ' + port)
  })
}
export async function handleMint(req: mintParams) {
  try {
    logger.info('Handling mint request: ')
    const minted = await mint(req)
    req.minted = minted.txHash
    req.policy = minted.policy
    updateStatus(req.id, 'minted')
    sendMail(`Minting of ${req.type} with ID ${req.id} successful!`)
    mints.insertOne({ ...minted.tx, hash: minted.txHash, policy: minted.policy, id: req.id })
    requests.filter((req) => req.status !== 'minted')
    return req
  } catch (error) {
    console.log(error)
    logger.error(error)
    updateStatus(req.id, 'failed')
    sendMail(`There was an error while minting request ${req.id}:  ${error}`)
    return {
      error:
        'There was an error when minting: ' +
        error +
        '<br> We are investigating the error and will pay back your ADA. You can contact us via +4915202510229',
    }
  }
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
