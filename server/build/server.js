import express from 'express'
import cors from 'cors'
import { config } from 'dotenv'
import crypto from 'crypto'
import { mint } from './mint.js'
import CardanoCliJs from 'cardanocli-js'
import { BlockFrostAPI } from '@blockfrost/blockfrost-js'
config()
const blockFrostApiKey = process.env.BLOCKFROST_API_KEY_MAINNET || ''
const blockfrost = new BlockFrostAPI({
  projectId: blockFrostApiKey,
})
const shelleyGenesisPath = process.env.GENESIS_PATH || ''
const cardano = new CardanoCliJs({ shelleyGenesisPath })
const wallet = cardano.wallet('Constantin')
let utxos = []
let utxoCounter = 0
let receivedPayments = []
let openRequests = []
// setInterval(async () => {
//   utxos = cardano.queryUtxo('addr1v9wn4hy9vhpggjznklav6pp4wtk3ldkktfp5m2ja36zv4sshsepsj')
//   console.log(utxos.length, utxoCounter, receivedPayments.length, openRequests.length)
//   console.table(utxos)
//   if (utxoCounter < utxos.length) {
//     try {
//       console.log('trying')
//       const payment = await payerAddr(utxos[utxoCounter + 1].txHash)
//       receivedPayments.push(payment)
//       utxoCounter++
//       checkPayment(receivedPayments, openRequests)
//     } catch (error) {
//       console.error(error)
//     }
//   }
// }, 1000)
checkUTXOs()
async function checkUTXOs() {
  utxos = cardano.queryUtxo('addr1v9wn4hy9vhpggjznklav6pp4wtk3ldkktfp5m2ja36zv4sshsepsj')
  console.log(utxos.length, utxoCounter, receivedPayments.length, openRequests.length)
  console.table(utxos)
  if (utxoCounter < utxos.length) {
    try {
      console.log('trying: ')
      const payment = await payerAddr(utxos[utxoCounter].txHash)
      receivedPayments.push(payment)
      checkPayment(receivedPayments, openRequests)
      utxoCounter++
      checkUTXOs()
    } catch (error) {
      console.error(error)
      checkUTXOs()
    }
  } else {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    checkUTXOs()
  }
}
const server = express()
server.use(express.json())
server.use(cors())
const port = process.env.PORT
server.get('/', (req, res) => {
  console.log('Request received: GET / ')
  res
    .send(
      '<p>This is the API connected to <a href="https://cardano-nft.de">https://cardano-nft.de</a>.</p>'
    )
    .status(200)
    .end()
})
server.post('/test', (req, res) => {
  //@ts-ignore
  const trust = verifyIntegrity(req.body, req.headers.checksum)
  trust
    ? res.status(200).send('Test request received.').end()
    : res
        .status(401)
        .end('Source not authenticated. Please contact me if you believe this is a mistake.')
})
server.post('/form', (req, res) => {
  console.log('Request received: POST /form ')
  // @ts-ignore
  const trust = verifyIntegrity(req.body, req.headers.checksum)
  if (trust) {
    // @ts-ignore
    handleSubmission(req)
    res.status(200).end()
  } else {
    res
      .status(401)
      .end('Source not authenticated. Please contact me if you believe this is a mistake.')
  }
})
server.listen(port, () => {
  console.log('Server running on port ' + port)
})
function handleSubmission({ body }) {
  const params = JSON.parse(body)
  params.paid ? mint(params) : openRequests.push(params)
}
function verifyIntegrity(body, sig) {
  const hmac = crypto.createHmac('sha512', 'example_key').update(JSON.stringify(body)).digest('hex')
  return sig === hmac
}
// sending to customer
async function payerAddr(txHash) {
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
function checkPayment(payments, requests) {
  for (const payment of payments) {
    for (const [i, req] of requests.entries()) {
      if (req.price === payment.amount) {
        req.addr = payment.payer
        mint(req)
        requests.splice(i, 1)
      }
    }
  }
}
