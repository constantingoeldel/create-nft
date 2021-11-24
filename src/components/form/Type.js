import React from 'react'
import Buttons from './StepButton'

export default function Type({ setStep, setType, type }) {
  return (
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
          <form onSubmit={(e) => e.preventDefault()}>
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
                      value={type}
                      name="type"
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option>NFT</option>
                      <option>Native Token</option>
                    </select>
                  </div>
                </div>
              </div>

              <Buttons setStep={setStep} next={'Next'} />
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
