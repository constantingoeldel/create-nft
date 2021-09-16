import { config } from 'dotenv'
import unirest from 'unirest'
config()

export default async function uploadIpfs(file) {
  const artHash = await new Promise((resolve, reject) => {
    unirest('POST', 'https://ipfs.blockfrost.io/api/v0/ipfs/add')
      .headers({
        project_id: process.env.BLOCKFROST_API_KEY,
      })
      .attach('file', file)
      .end((res) => {
        if (res.error) reject(res.error)
        pinIpfs(res.body.ipfs_hash)
        resolve(res.body.ipfs_hash)
      })
  })

  return artHash

  function pinIpfs(hash) {
    const req = unirest('POST', 'https://ipfs.blockfrost.io/api/v0/ipfs/pin/add/' + hash)
      .headers({
        project_id: process.env.BLOCKFROST_API_KEY,
      })
      .end(function (res) {
        if (res.error) throw new Error(res.error)
      })
  }
}
