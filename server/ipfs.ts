import { config } from 'dotenv'
import unirest from 'unirest'
import { readFileSync } from 'fs'
config()

export default async function uploadIpfs(path: string): Promise<string> {
  const file = readFileSync(path)
  const artHash: string = await new Promise((resolve, reject) => {
    unirest('POST', 'https://ipfs.blockfrost.io/api/v0/ipfs/add')
      .headers({
        project_id: process.env.BLOCKFROST_API_KEY_IPFS,
      })
      .attach('file', file)
      .end((res: { error: string; body: { ipfs_hash: string } }) => {
        if (res.error) reject(res.error)
        pinIpfs(res.body.ipfs_hash)
        resolve(res.body.ipfs_hash)
      })
  })

  return artHash

  function pinIpfs(hash: string) {
    const req = unirest('POST', 'https://ipfs.blockfrost.io/api/v0/ipfs/pin/add/' + hash)
      .headers({
        project_id: process.env.BLOCKFROST_API_KEY_IPFS,
      })
      .end(function (res: { error: string }) {
        if (res.error) throw new Error(res.error)
      })
  }
}
