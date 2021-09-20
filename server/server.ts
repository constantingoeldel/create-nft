import express from 'express'
import { config } from 'dotenv'
import crypto from 'crypto'
import { mint } from './mint.js'
import CardanoCliJs from 'cardanocli-js'
import { BlockFrostAPI } from '@blockfrost/blockfrost-js'
import { mintParams } from './mint'
config()

interface receivedPayment {
  amount: number
  payer: string
}

interface formResponse {
  hidden: { id: string; adaprice: number }
  answers: {
    type: 'choice' | 'number' | 'file_url' | 'text' | 'payment'
    choice: { label: string }
    field: { id: string }
    text: string
    file_url: string
    number: number
    payment: {
      amount: string
      success: boolean
    }
  }[]
}
const typeformSecret = process.env.TYPEFORM_SECRET || ''
const blockFrostApiKey = process.env.BLOCKFROST_API_KEY_MAINNET || ''
const blockfrost = new BlockFrostAPI({
  projectId: blockFrostApiKey,
})

const shelleyGenesisPath = process.env.GENESIS_PATH || ''
const cardano = new CardanoCliJs({ shelleyGenesisPath })

const wallet = cardano.wallet('Constantin')

let utxos = []
let utxoCounter = 0
let receivedPayments: receivedPayment[] = []
let openRequests: mintParams[] = []

setInterval(async () => {
  utxos = cardano.queryUtxo('addr1v9wn4hy9vhpggjznklav6pp4wtk3ldkktfp5m2ja36zv4sshsepsj')
  if (utxoCounter > utxos.length) {
    const payment = await payerAddr(utxos[utxos.length - 1])
    receivedPayments.push(payment)
    utxoCounter = utxos.length
    checkPayment(receivedPayments, openRequests)
  }
}, 1000)

const server = express()
server.use(express.json())
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

server.post('/form', (req, res) => {
  console.log('Request received: POST /form ')
  handleSubmission(req)
  res.status(200).end()
})

server.listen(port, () => {
  console.log('Server running on port ' + port)
})
interface Request {
  body: { form_response: formResponse }
  headers: { ['typeform-signature']: string }
}
function handleSubmission({ body, headers }: Request) {
  // TODO trust needs work
  const trust = verifyIntegrity(body.toString(), headers['typeform-signature'])
  const params = getAnswers(body.form_response)
  params.paid && mint(params)
  openRequests.push(params)
}

function getAnswers(formResponse: formResponse) {
  const answers: mintParams = {
    id: '',
    type: 'NFT',
    amount: 1,
    name: '',
    description: '',
    author: '',
    symbol: '',
    payment: '',
    file: '',
    addr: '',
    price: 0,
    paid: false,
  }
  const answersRaw = formResponse.answers
  answers.id = formResponse.hidden.id
  answers.price = formResponse.hidden.adaprice
  answersRaw.forEach((answer) => {
    const id = answer.field.id
    if (answer.type === 'number') {
      answers.amount = answer.number
      answers.type = 'FT'
    }
    if (answer.choice && answer.choice.label === 'With ADA') answers.payment = 'ADA'
    if (answer.choice && answer.choice.label === 'With credit card') answers.payment = 'CC'
    if (answer.type === 'file_url') answers.file = answer.file_url
    if (answer.type === 'payment' && answer.payment.success) answers.paid = true
    if (answer.type === 'text') {
      if (id === '8BuyosNLeD5S') answers.name = answer.text
      if (id === 'XjwAGN6kgmG0') answers.description = answer.text
      if (id === 'eQcnhbmb09fr') answers.symbol = answer.text
      if (id === '4eILf5EfrYZx') answers.author = answer.text
      if (id === 'WdOBfv9vaGtF') answers.addr = answer.text
    }
  })
  return answers
}

function verifyIntegrity(body: string, sig: string) {
  return (
    sig === crypto.createHmac('sha256', typeformSecret).update(body.toString()).digest('base64')
  )
}

// sending to customer,

async function payerAddr(txHash: string) {
  let outputs = {
    amount: 0,
    payer: '',
  }
  const tx = await blockfrost.txsUtxos(txHash)
  tx.outputs.forEach((output) => {
    output.address === wallet.paymentAddr
      ? (outputs.amount = parseInt(output.amount.filter((a) => a.unit === 'lovelace')[0].quantity))
      : (outputs.payer = output.address)
  })
  return outputs
}

function checkPayment(payments: receivedPayment[], requests: mintParams[]) {
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
