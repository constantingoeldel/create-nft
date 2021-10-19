import React, { useState } from 'react'
import Buttons from './StepButton'

export default function Payment({ price, setStep, type, submitForm }) {
  const [copied, setCopied] = useState(false)

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

  return (
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
              setStep((s) => s + 1)
              submitForm()
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
                          We constantly monitor received payments and will proceed with your {type}{' '}
                          as soon as possible
                        </p>
                      </div>
                    </div>
                  </div>
                </fieldset>
              </div>
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="inline-flex justify-center py-2 px-4 mr-2  border-2 border-indigo-600 shadow-sm text-sm font-medium rounded-md text-indigo-600 hover:text-indigo-700 bg-white hover:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Back
                </button>
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
  )
}
