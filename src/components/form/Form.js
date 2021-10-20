import React, { useState } from 'react'
import jsSHA from 'jssha'
import Divider from './Divider'
import Type from './Type'
import Details from './Details'
import Payment from './Payment'
import Status from './Status'
// Validation
export default function Form({ price = '5.0', id }) {
  const { GATSBY_SERVER_URL } = process.env
  const [step, setStep] = useState(0)
  const [type, setType] = useState('NFT')
  const [file, setFile] = useState()
  const [input, setInput] = useState({
    name: '',
    author: '',
    description: '',
    amount: '1',
    symbol: '',
  })
  function submitForm() {
    const body = JSON.stringify({
      id,
      type,
      name: input.name,
      author: input.author,
      description: input.description,
      amount: Number.parseInt(input.amount),
      symbol: input.symbol,
      price: price,
    })
    const crypt = new jsSHA('SHA-512', 'TEXT')
    crypt.setHMACKey('735a1f6c-7921-410c-a954-dce57483f195', 'TEXT')
    crypt.update(body)
    const hmac = crypt.getHMAC('HEX')

    const dataHeaders = new Headers()
    dataHeaders.append('checksum', hmac)
    dataHeaders.append('Content-Type', 'application/json')

    const inputOptions = {
      method: 'POST',
      headers: dataHeaders,
      body: body,
      redirect: 'follow',
    }

    if (file) {
      const fileHeaders = new Headers()
      fileHeaders.append('id', id)

      const fileData = new FormData()
      fileData.append('file', file, file.name)

      const fileOptions = {
        method: 'POST',
        headers: fileHeaders,
        body: fileData,
        redirect: 'follow',
      }

      fetch(GATSBY_SERVER_URL + '/file', fileOptions)
        .then((response) => response.text())
        .then((result) => console.log(result))
        .catch((error) => console.log('error', error))
    }
    console.log(inputOptions)
    fetch(GATSBY_SERVER_URL + '/form', inputOptions)
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
