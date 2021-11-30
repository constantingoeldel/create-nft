import { requests } from '../server.js'

// @ts-ignore
export default function status(req, res) {
  const id = req.params.id
  if (id === 'server') {
    res.status(200).end('All systems nominal')
    return
  }
  const request = requests.find((request) => request.id === id)

  if (!request) {
    res.status(404).end('Request with ID ' + id + ' not found')
    return
  }
  res
    .status(200)
    .json({
      id: id,
      received: true,
      paid: request.paid,
      uploaded: !!request.file,
      minted: request.minted,
      policy: request.policy,
      error:
        request.status === 'failed'
          ? 'Something went wrong on our end. We are investigating the error and will pay back your ADA. You can contact me via <a>tel:+4915202510229</a>'
          : false,
    })
    .end()
}
