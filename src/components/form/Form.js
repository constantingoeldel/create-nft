import React, { useEffect, useState } from 'react'
import { v4 as uuid } from 'uuid'
import jsSHA from 'jssha'
import Divider from './Divider'
import Type from './Type'
import Details from './Details'
import Payment from './Payment'
import Status from './Status'
// Validation
export default function Form() {
  const { GATSBY_SERVER_URL } = process.env
  const [step, setStep] = useState(0)
  const [type, setType] = useState('NFT')
  const [file, setFile] = useState()
  const [price, setPrice] = useState(0)
  const [id, setId] = useState('')
  const [input, setInput] = useState({
    author: '',
    description: '',
    symbol: '',
    amount: 1,
    description: '',
    name: '',
  })
  function newToken() {
    fetch(GATSBY_SERVER_URL, +'/new')
      .then((res) => res.json())
      .then((res) => {
        setPrice(res.price)
        setId(res.id)
      })
  }
  useEffect(() => newToken(), [])

  function submitForm() {
    const content = JSON.stringify({
      id,
      type,
      price: String(price),
      name: input.name,
      author: input.author,
      description: input.description,
      symbol: input.symbol,
      amount: String(input.amount),
    })
    const crypt = new jsSHA('SHA-512', 'TEXT')
    crypt.setHMACKey('735a1f6c-7921-410c-a954-dce57483f195', 'TEXT')
    crypt.update(content)
    const hmac = crypt.getHMAC('HEX')
    console.log(hmac, content)
    const headers = new Headers()
    headers.append('checksum', hmac)

    const body = new FormData()
    file && body.append('file', file, file.name)
    body.append('id', id)
    body.append('type', type)
    body.append('price', price)
    body.append('name', input.name)
    body.append('author', input.author || '')
    body.append('description', input.description || '')
    body.append('symbol', input.symbol || '')
    body.append('amount', input.amount)

    const options = {
      method: 'POST',
      headers,
      body,
      redirect: 'follow',
    }

    fetch(GATSBY_SERVER_URL + '/form', options)
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.log('error', error))
  }
  const steps = {
    [0]: () => <Type setStep={setStep} setType={setType} />,
    [1]: () => (
      <Details
        setFile={setFile}
        file={file}
        setInput={setInput}
        input={input}
        type={type}
        setStep={setStep}
      />
    ),
    [2]: () => <Payment setStep={setStep} type={type} price={price} submitForm={submitForm} />,
    [3]: () => (
      <Status step={step} id={id} setStep={setStep} type={type} newToken={() => newToken} />
    ),
  }
  return (
    <section className="mt-10">
      <Divider />
      {steps[step]()}
      <Divider />
    </section>
  )
}
