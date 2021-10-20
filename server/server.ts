import { renameSync } from 'fs'
import express from 'express'
import formidable from 'express-formidable'
import cors from 'cors'
import { config } from 'dotenv'
import crypto from 'crypto'
import { mint } from './mint.js'
import CardanoCliJs from 'cardanocli-js'
import { BlockFrostAPI } from '@blockfrost/blockfrost-js'
import { mintParams } from './mint'
import helmet from 'helmet'
config()

interface receivedPayment {
  amount: number
  payer: string
}

const blockFrostApiKey = process.env.BLOCKFROST_API_KEY_MAINNET || ''
const blockfrost = new BlockFrostAPI({
  projectId: blockFrostApiKey,
})

const shelleyGenesisPath = process.env.GENESIS_PATH || ''
const cardano = new CardanoCliJs({ shelleyGenesisPath })

const wallet = cardano.wallet('Constantin')

let utxos = []
let receivedPayments: receivedPayment[] = []
let openRequests: mintParams[] = []

async function checkUTXOs() {
  utxos = cardano.queryUtxo('addr1v9wn4hy9vhpggjznklav6pp4wtk3ldkktfp5m2ja36zv4sshsepsj').reverse()
  console.log(utxos.length, receivedPayments.length, openRequests.length)
  console.table(utxos)
  if (receivedPayments.length < utxos.length) {
    try {
      const payment = await payerAddr(utxos[receivedPayments.length].txHash)
      receivedPayments.push(payment)
      checkPayment(receivedPayments, openRequests)
      checkUTXOs()
    } catch (error) {
      console.error(error)
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

server.post('/test', (req, res) => {
  console.log(req.fields)
  res.status(200).json(req.fields).end()
})

server.get('/', (_, res) => {
  console.log('Request received: GET / ')
  res
    .send(
      '<p>This is the API connected to <a href="https://cardano-nft.de">https://cardano-nft.de</a>.</p>'
    )
    .status(200)
    .end()
})
server.post('/form', (req, res) => {
  // @ts-ignore
  const params: mintParams = req.fields
  const files = req.files
  // @ts-ignore
  const file = Array.isArray(files) ? files.files[0] : files.file
  const { checksum } = req.headers
  if (typeof checksum !== 'string') {
    console.log('No auth header. Aborting.')
    res.status(418).end('No auth header.')
    return
  }
  if (!params || !params.id) {
    console.log('No content. Aborting.')
    res.status(418).end('No content.')
    return
  }
  const trust = req.fields && verifyIntegrity(JSON.stringify(params), checksum)
  if (!trust) {
    console.log('Checksum did not match. Aborting.')
    res.status(401).end('Source not authenticated.')
    return
  }
  console.log('Trusted request received. ID: ', params.id)

  if (file) {
    renameSync('./' + file.path, './tmp/' + params.id + '_' + file.name)
    params.file = './tmp/' + params.id + '_' + file.name
    console.log('Uploaded file: ' + params.file)
  }

  // @ts-ignore
  res.status(200).end('Submission successful. Checking for payment.')
  params.price = params.price * 1_000_000
  params.paid ? mint(params) : openRequests.push(params)
  console.table(openRequests)
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
  console.log('Server running on port ' + port)
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
  sig !== hmac && console.log(hmac)
  return sig === hmac
}

async function payerAddr(txHash: string) {
  console.log(txHash)
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
  console.log(info)
  return info
}

function checkPayment(payments: receivedPayment[], requests: mintParams[]) {
  for (const payment of payments) {
    for (const [i, req] of requests.entries()) {
      if (req.price === payment.amount) {
        console.log('Match for request ' + req.id + ' found: Address ' + payment.payer)
        req.addr = payment.payer
        mint(req)
        requests.splice(i, 1)
      }
    }
  }
}
