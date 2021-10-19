import React from 'react'
import Buttons from './StepButton'

export default function Details({ setStep, setInput, input, type, setFile, file }) {
  const fileURL = file ? URL.createObjectURL(file) : ''

  return (
    <div className="mt-10 sm:mt-0">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <div className="px-4 sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Fill in the details</h3>
            <p className="mt-1 text-sm text-gray-600">All field except for the name are optional</p>
          </div>
        </div>
        <div className="mt-5 md:mt-0 md:col-span-2">
          <form
            onSubmit={(event) => {
              console.log('submitted')
              event.preventDefault()
              setStep((s) => s + 1)
            }}
          >
            <div className="shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="asset-name" className="block text-sm font-medium text-gray-700">
                      {type} name (required)
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
                        Token Symbol (required)
                      </label>
                      <input
                        onChange={(event) =>
                          setInput({ ...input, symbol: event.target.value.toUpperCase() })
                        }
                        type="text"
                        name="symbol"
                        id="symbol"
                        autoComplete="name"
                        required
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
                      onChange={(event) => setInput({ ...input, description: event.target.value })}
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
                  Next
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
