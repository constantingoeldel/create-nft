import React, { useEffect, useState } from 'react'
import jsSHA from 'jssha'
import Divider from './Divider'
import Type from './Type'
import Details from './Details'
import Payment from './Payment'
import Status from './Status'
// Validation
export default function Form({ input, setInput }) {
  const { GATSBY_SERVER_URL } = process.env
  const [step, setStep] = useState(0)
  const [type, setType] = useState('NFT')
  const [file, setFile] = useState()
  const [price, setPrice] = useState('calculating...')
  const [id, setId] = useState('fetcherror')

  useEffect(() => {
    fetch(GATSBY_SERVER_URL + '/status/server')
      .then((res) => {
        res.status !== 200 && alert('Server not responding, please do not submit any requests.')
      })
      .catch((err) => alert('Server not responding, please do not submit any requests.'))
  }, [])

  function submitForm() {
    const properties = JSON.stringify({
      name: input.name,
      author: input.author,
      description: input.description,
      symbol: input.symbol,
    })

    const crypt = new jsSHA('SHA-512', 'TEXT')
    crypt.setHMACKey('735a1f6c-7921-410c-a954-dce57483f195', 'TEXT')
    crypt.update(properties)
    const hmac = crypt.getHMAC('HEX')
    const headers = new Headers()
    headers.append('checksum', hmac)

    const body = new FormData()
    file && body.append('file', file, file.name)
    body.append('type', type)
    body.append('properties', properties)
    body.append('amount', input.amount)

    const options = {
      method: 'POST',
      headers,
      body,
      redirect: 'follow',
    }

    fetch(GATSBY_SERVER_URL + '/form', options)
      .then((response) => response.json())
      .then((result) => {
        setId(result.id)
        setPrice(result.price)
      })
      .catch((error) => console.log('error', error))
  }
  const steps = {
    [0]: () => <Type setStep={setStep} setType={setType} type={type} />,
    [1]: () => (
      <Details
        setFile={setFile}
        file={file}
        setInput={setInput}
        input={input}
        type={type}
        setStep={setStep}
        submitForm={submitForm}
      />
    ),
    [2]: () => <Payment setStep={setStep} type={type} price={price} />,
    [3]: () => <Status step={step} id={id} setStep={setStep} type={type} />,
  }
  return (
    <section className="mt-10">
      <Divider />
      {steps[step]()}
      <Divider />
    </section>
  )
}
