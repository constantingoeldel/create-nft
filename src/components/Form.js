import React, { useState } from 'react'
import jsSHA from 'jssha'

export default function Form({ price = '5.0', id }) {
  const [step, setStep] = useState(0)
  const [type, setType] = useState('NFT')
  const [copied, setCopied] = useState(false)
  const [file, setFile] = useState(null)
  const [input, setInput] = useState({
    name: '',
    author: '',
    description: '',
    amount: '1',
    symbol: '',
  })
  const fileURL = file ? URL.createObjectURL(file) : ''
  function submitForm() {
    const body = JSON.stringify({
      id: id,
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

    fetch('http://localhost:3000/file', fileOptions)
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.log('error', error))

    fetch('http://localhost:3000/form', inputOptions)
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.log('error', error))
  }
  function copy(type) {
    navigator.clipboard
      .writeText(
        type === 'addr' ? 'addr1v9wn4hy9vhpggjznklav6pp4wtk3ldkktfp5m2ja36zv4sshsepsj' : price
      )
      .then(() => {
        setCopied(type)
        copyTimeout && clearTimeout(copyTimeout)
        let copyTimeout = setTimeout(() => {
          setCopied(false)
        }, 1500)
      })
  }

  function nextStep(e, step) {
    e.preventDefault()
    setStep(step)
  }

  return (
    <>
      <div className="hidden sm:block" aria-hidden="true">
        <div className="py-5">
          <div className="border-t border-gray-200" />
        </div>
      </div>

      <div className="mt-10 sm:mt-0">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Select the token type</h3>
              <p className="mt-1 text-sm text-gray-600">
                Do you want to have just one NFT or many tokens?
              </p>
            </div>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <form onSubmit={(event) => nextStep(event, 1)}>
              <div className="shadow overflow-hidden sm:rounded-md">
                <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 ">
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                        Token type
                      </label>
                      <p className="my-2 text-xs text-gray-600">
                        Choose between a unique NFT or an interchangable custom token
                      </p>
                      <select
                        onChange={(event) => setType(event.target.value)}
                        id="type"
                        name="type"
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option>NFT</option>
                        <option>Native Token</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Next
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="hidden sm:block" aria-hidden="true">
        <div className="py-5">
          <div className="border-t border-gray-200" />
        </div>
      </div>

      <div className="mt-10 sm:mt-0">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Fill in the details</h3>
              <p className="mt-1 text-sm text-gray-600">
                All field except for the name are optional
              </p>
            </div>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <form onSubmit={(event) => nextStep(event, 2)}>
              <div className="shadow overflow-hidden sm:rounded-md">
                <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="asset-name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        {type} name
                      </label>
                      <input
                        onChange={(event) => setInput({ ...input, name: event.target.value })}
                        required
                        type="text"
                        name="asset-name"
                        id="asset-name"
                        autoComplete="username"
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    {type === 'NFT' ? (
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="author" className="block text-sm font-medium text-gray-700">
                          Author name
                        </label>
                        <input
                          onChange={(event) => setInput({ ...input, author: event.target.value })}
                          type="text"
                          name="author"
                          id="author"
                          autoComplete="name"
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    ) : (
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="symbol" className="block text-sm font-medium text-gray-700">
                          Token Symbol
                        </label>
                        <input
                          onChange={(event) =>
                            setInput({ ...input, symbol: event.target.value.toUpperCase() })
                          }
                          type="text"
                          name="symbol"
                          id="symbol"
                          autoComplete="name"
                          value={input.symbol}
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    )}

                    <div className="col-span-6 sm:col-span-4">
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Description
                      </label>
                      <input
                        onChange={(event) =>
                          setInput({ ...input, description: event.target.value })
                        }
                        type="text"
                        name="description"
                        id="description"
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    {type === 'Native Token' && (
                      <div className="col-span-6 sm:col-span-4">
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                          Desired Amount
                        </label>
                        <input
                          onChange={(event) => setInput({ ...input, amount: event.target.value })}
                          type="number"
                          name="amount"
                          id="amount"
                          value={input.amount}
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{type} file</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      {file ? (
                        <div className="relative">
                          <img src={fileURL} />
                          <button
                            className="rounded-full bg-blue-900 p-2 absolute top-0 right-0"
                            onClick={() => setFile()}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="#fff"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1 text-center">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                            aria-hidden="true"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="file-upload"
                              className="relative z-1 cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                            >
                              <span>Upload a file</span>
                              <input
                                onChange={(event) => setFile(event.target.files[0])}
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                className="sr-only"
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PDF, JPG, GIF up to 15MB</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Next
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="hidden sm:block" aria-hidden="true">
        <div className="py-5">
          <div className="border-t border-gray-200" />
        </div>
      </div>

      <div className="mt-10 sm:mt-0">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Payment</h3>
              <p className="mt-1 text-sm text-gray-600">
                Please send <b> {price} </b> ADA to the following address on the Cardano blockchain:
              </p>
            </div>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <form
              onSubmit={(event) => {
                event.preventDefault()
                submitForm()
                nextStep(event, 3)
              }}
            >
              <div className="shadow overflow-hidden sm:rounded-md">
                <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                  <div className="text-sm flex">
                    <button
                      type="button"
                      className="hidden sm:flex sm:items-center sm:justify-center relative w-9 h-9 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 text-gray-400 hover:text-gray-600 group ml-2.5 "
                      style={{
                        color: copied === 'amount' ? '#06B6D4' : '#acb1bc',
                        rotate: copied === 'amount' ? '10deg' : '0deg',
                      }}
                      onClick={() => copy('amount')}
                    >
                      <span className="sr-only">Copy amount</span>
                      <span
                        x-show="copied"
                        style={{ display: 'none' }}
                        className="absolute inset-x-0 bottom-full mb-2.5 flex justify-center"
                      >
                        <span className="bg-gray-900 text-white rounded-md text-[0.625rem] leading-4 tracking-wide font-semibold uppercase py-1 px-3 filter drop-shadow-md">
                          <svg
                            aria-hidden="true"
                            width="16"
                            height="6"
                            viewBox="0 0 16 6"
                            className="text-gray-900 absolute top-full left-1/2 -mt-px -ml-2"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M15 0H1V1.00366V1.00366V1.00371H1.01672C2.72058 1.0147 4.24225 2.74704 5.42685 4.72928C6.42941 6.40691 9.57154 6.4069 10.5741 4.72926C11.7587 2.74703 13.2803 1.0147 14.9841 1.00371H15V0Z"
                              fill="currentColor"
                            ></path>
                          </svg>
                          Copied!
                        </span>
                      </span>
                      <svg
                        aria-hidden="true"
                        width="32"
                        height="32"
                        viewBox="0 0 32 32"
                        fill="none"
                        className="stroke-current transform group-hover:rotate-[-4deg] transition"
                      >
                        <path
                          d="M12.9975 10.7499L11.7475 10.7499C10.6429 10.7499 9.74747 11.6453 9.74747 12.7499L9.74747 21.2499C9.74747 22.3544 10.6429 23.2499 11.7475 23.2499L20.2475 23.2499C21.352 23.2499 22.2475 22.3544 22.2475 21.2499L22.2475 12.7499C22.2475 11.6453 21.352 10.7499 20.2475 10.7499L18.9975 10.7499"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                        <path
                          d="M17.9975 12.2499L13.9975 12.2499C13.4452 12.2499 12.9975 11.8022 12.9975 11.2499L12.9975 9.74988C12.9975 9.19759 13.4452 8.74988 13.9975 8.74988L17.9975 8.74988C18.5498 8.74988 18.9975 9.19759 18.9975 9.74988L18.9975 11.2499C18.9975 11.8022 18.5498 12.2499 17.9975 12.2499Z"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                        <path
                          d="M13.7475 16.2499L18.2475 16.2499"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                        <path
                          d="M13.7475 19.2499L18.2475 19.2499"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                        <g
                          className={copied ? '' : 'opacity-0'}
                          className="opacity-0 transition-opacity"
                        >
                          <path
                            d="M15.9975 5.99988L15.9975 3.99988"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          ></path>
                          <path
                            d="M19.9975 5.99988L20.9975 4.99988"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          ></path>
                          <path
                            d="M11.9975 5.99988L10.9975 4.99988"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          ></path>
                        </g>
                      </svg>
                    </button>
                    Amount: {price}
                  </div>
                  <div className="text-sm flex">
                    <button
                      type="button"
                      className="hidden sm:flex sm:items-center sm:justify-center relative w-9 h-9 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 text-gray-400 hover:text-gray-600 group ml-2.5 "
                      style={{
                        color: copied === 'addr' ? '#06B6D4' : '#acb1bc',
                        rotate: copied === 'addr' ? '10deg' : '0deg',
                      }}
                      onClick={() => copy('addr')}
                    >
                      <span className="sr-only">Copy address</span>
                      <span
                        x-show="copied"
                        style={{ display: 'none' }}
                        className="absolute inset-x-0 bottom-full mb-2.5 flex justify-center"
                      >
                        <span className="bg-gray-900 text-white rounded-md text-[0.625rem] leading-4 tracking-wide font-semibold uppercase py-1 px-3 filter drop-shadow-md">
                          <svg
                            aria-hidden="true"
                            width="16"
                            height="6"
                            viewBox="0 0 16 6"
                            className="text-gray-900 absolute top-full left-1/2 -mt-px -ml-2"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M15 0H1V1.00366V1.00366V1.00371H1.01672C2.72058 1.0147 4.24225 2.74704 5.42685 4.72928C6.42941 6.40691 9.57154 6.4069 10.5741 4.72926C11.7587 2.74703 13.2803 1.0147 14.9841 1.00371H15V0Z"
                              fill="currentColor"
                            ></path>
                          </svg>
                          Copied!
                        </span>
                      </span>
                      <svg
                        aria-hidden="true"
                        width="32"
                        height="32"
                        viewBox="0 0 32 32"
                        fill="none"
                        className="stroke-current transform group-hover:rotate-[-4deg] transition"
                      >
                        <path
                          d="M12.9975 10.7499L11.7475 10.7499C10.6429 10.7499 9.74747 11.6453 9.74747 12.7499L9.74747 21.2499C9.74747 22.3544 10.6429 23.2499 11.7475 23.2499L20.2475 23.2499C21.352 23.2499 22.2475 22.3544 22.2475 21.2499L22.2475 12.7499C22.2475 11.6453 21.352 10.7499 20.2475 10.7499L18.9975 10.7499"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                        <path
                          d="M17.9975 12.2499L13.9975 12.2499C13.4452 12.2499 12.9975 11.8022 12.9975 11.2499L12.9975 9.74988C12.9975 9.19759 13.4452 8.74988 13.9975 8.74988L17.9975 8.74988C18.5498 8.74988 18.9975 9.19759 18.9975 9.74988L18.9975 11.2499C18.9975 11.8022 18.5498 12.2499 17.9975 12.2499Z"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                        <path
                          d="M13.7475 16.2499L18.2475 16.2499"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                        <path
                          d="M13.7475 19.2499L18.2475 19.2499"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                        <g
                          className={copied ? '' : 'opacity-0'}
                          className="opacity-0 transition-opacity"
                        >
                          <path
                            d="M15.9975 5.99988L15.9975 3.99988"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          ></path>
                          <path
                            d="M19.9975 5.99988L20.9975 4.99988"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          ></path>
                          <path
                            d="M11.9975 5.99988L10.9975 4.99988"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          ></path>
                        </g>
                      </svg>
                    </button>
                    <p className="b overflow-scroll">
                      Address: <br />
                      addr1v9wn4hy9vhpggjznklav6pp4wtk3ldkktfp5m2ja36zv4sshsepsj
                    </p>
                  </div>
                  <a
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-500 hover:bg-green-600 focus:outline-none hover:text-gray-100"
                    href={`web+cardano:addr1v9wn4hy9vhpggjznklav6pp4wtk3ldkktfp5m2ja36zv4sshsepsj?amount=${price}`}
                    rel="noopener"
                    target="_blank"
                  >
                    One-Click for Yoroi users
                  </a>
                  <fieldset>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            required
                            id="sent"
                            name="sent"
                            type="checkbox"
                            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="sent" className="font-medium text-gray-700">
                            I sent the {price} ADA
                          </label>
                          <p className="text-gray-500">
                            We constantly monitor received payments and will proceed with your{' '}
                            {type} as soon as possible
                          </p>
                        </div>
                      </div>
                    </div>
                  </fieldset>
                </div>
                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Next
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        <div className="hidden sm:block" aria-hidden="true">
          <div className="py-5">
            <div className="border-t border-gray-200" />
          </div>
        </div>

        <div className="mt-10 sm:mt-0">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <div className="px-4 sm:px-0">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Confirmation</h3>
                <p className="mt-1 text-sm text-gray-600">
                  We are waiting for the payment to be confirmed. This can take up to 3 minutes.
                  After we receive the payment, your {type} will be minted.
                </p>
              </div>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <form onSubmit={(event) => nextStep(event, 4)}>
                <div className="shadow overflow-hidden sm:rounded-md">
                  <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                    <div className="grid grid-cols-6 gap-6">
                      <div className="col-span-6 ">
                        <div className="flex flex-col">
                          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                      >
                                        Step
                                      </th>
                                      <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                      >
                                        Status
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    <tr key={'payment'}>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                          <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                              Payment
                                            </div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                          Pending
                                        </span>
                                      </td>
                                    </tr>
                                    <tr key={'upload'}>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                          <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                              Upload
                                            </div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                          Queued
                                        </span>
                                      </td>
                                    </tr>
                                    <tr key={'Minting'}>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                          <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                              Minting
                                            </div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                          Queued
                                        </span>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Finish
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
