import React from 'react'

export default function Buttons({ setStep, back, next }) {
  return (
    <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
      {back && (
        <input
          type="button"
          onClick={() => setStep((s) => s - 1)}
          className="inline-flex justify-center py-2 px-4 mr-2  border-2 border-indigo-600 shadow-sm text-sm font-medium rounded-md text-indigo-600 hover:text-indigo-700 bg-white hover:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          value={back}
        />
      )}
      {next && (
        <input
          onClick={() => {
            console.log('input')
            setStep((s) => s + 1)
          }}
          type="submit"
          form="details"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          value={next}
        />
      )}
    </div>
  )
}
