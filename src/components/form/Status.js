import React, { useEffect, useState } from 'react'

export default function Status({ step, type, setStep, id }) {
  const { GATSBY_SERVER_URL } = process.env
  const [status, setStatus] = useState({
    id: id,
    received: false,
    paid: false,
    minted: false,
    uploaded: false,
    policy: '',
    error: false,
  })
  const statusOptions = {
    method: 'GET',
    redirect: 'follow',
  }
  useEffect(() => {
    const interval = setInterval(() => {
      fetch(GATSBY_SERVER_URL + '/status/' + id, statusOptions)
        .then((response) => response.json())
        .then((result) => setStatus(result))
        .catch((error) => console.log('error', error))
    }, 1000)
    return () => clearInterval(interval)
  }, [step])

  status.error && alert(status.error)
  return (
    <div className="mt-10 sm:mt-0">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <div className="px-4 sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Confirmation</h3>
            <p className="mt-1 text-sm text-gray-600">
              We are waiting for the payment to be confirmed. This can take up to 3 minutes. After
              we receive the payment, your {type} will be minted.
              {status.minted && status.policy && (
                <p className="mt-1 text-sm text-gray-600">
                  Your token has been successfully minted. You can see your token here:{' '}
                  <a href={`https://pool.pm/${status.policy}`}>Pool.pm</a>
                  <br />
                  It can take a few minutes for your token to be visible.
                </p>
              )}
            </p>
          </div>
        </div>
        <div className="mt-5 md:mt-0 md:col-span-2">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setStep(0)
            }}
          >
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
                                <tr key={'upload'}>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="ml-4">
                                        <div className="flex text-sm font-medium text-gray-900">
                                          Upload (optional)
                                          {status.uploaded || (
                                            <div className="animate-spin rounded-full mx-4 mt-1 h-4 w-4 border-b-2 border-blue-900"></div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {status.uploaded ? <Successful /> : <Pending />}
                                  </td>
                                </tr>
                                <tr key={'payment'}>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="ml-4">
                                        <div className="flex text-sm font-medium text-gray-900">
                                          Payment
                                          {status.paid || (
                                            <div className="animate-spin rounded-full mx-4 mt-1 h-4 w-4 border-b-2 border-blue-900"></div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {status.paid ? <Successful /> : <Pending />}
                                  </td>
                                </tr>
                                <tr key={'Minting'}>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="ml-4">
                                        <div className="flex text-sm font-medium text-gray-900">
                                          Minting
                                          {status.paid && !status.minted && (
                                            <div className="animate-spin rounded-full mx-4 mt-1 h-4 w-4 border-b-2 border-blue-900"></div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {status.paid ? (
                                      status.minted ? (
                                        <Successful />
                                      ) : (
                                        <Pending />
                                      )
                                    ) : (
                                      <Queued />
                                    )}
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
                  Again
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
function Successful() {
  return (
    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
      Successful
    </span>
  )
}

function Pending() {
  return (
    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
      Pending
    </span>
  )
}

function Queued() {
  return (
    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
      Queued
    </span>
  )
}
