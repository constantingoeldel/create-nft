import express from 'express'
import { config } from 'dotenv'
import crypto from 'crypto'
import { mint } from './mint.js'
config()

const server = express()
server.use(express.json())
const port = process.env.PORT

server.post('/form', (req, res) => {
  handleSubmission(req)
  res.status('200').end()
})

server.listen(port, () => {
  console.log('Server running on port ' + port)
})

function handleSubmission({ body, headers }) {
  // TODO trust needs work
  const trust = verifyIntegrity(body, headers['typeform-signature'])
  const params = getAnswers(body)
  params.paid && mint(params)
}

function getAnswers(payload) {
  const answers = {
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
  const answersRaw = payload.form_response.answers
  answers.id = payload.form_response.hidden.id
  answers.price = payload.form_response.hidden.adaprice
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

function verifyIntegrity(body, sig) {
  return (
    sig ===
    crypto
      .createHmac('sha256', process.env.TYPEFORM_SECRET)
      .update(body.toString())
      .digest('base64')
  )
}

// Response, ada checking, sending to customer, integration with typeform, hosting, token minting, iframe size, id and stuff
