import { config } from 'dotenv'
import unirest from 'unirest'
import { createWriteStream } from 'fs'
import request from 'request'
config()

export default async function uploadIpfs(uri: string): Promise<string> {
  const file = await downloadFile(uri)
  const artHash: string = await new Promise((resolve, reject) => {
    unirest('POST', 'https://ipfs.blockfrost.io/api/v0/ipfs/add')
      .headers({
        project_id: process.env.BLOCKFROST_API_KEY,
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
        project_id: process.env.BLOCKFROST_API_KEY,
      })
      .end(function (res: { error: string }) {
        if (res.error) throw new Error(res.error)
      })
  }
}
async function downloadFile(uri: string) {
  const extention = uri.split('.')[uri.split('.').length - 1]
  const filename = './tmp/' + uri.split('/')[5] + '.' + extention
  await new Promise((resolve, reject) => {
    request(uri)
      .pipe(createWriteStream(filename))
      .on('close', (err: string) => (err ? reject(err) : resolve(filename)))
  })
  return filename
}
