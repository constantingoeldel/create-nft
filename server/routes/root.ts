// @ts-ignore
const root = (_, res) => {
  res
    .send(
      '<p>This is the API connected to <a href="https://cardano-nft.de">https://cardano-nft.de</a>.</p>'
    )
    .status(200)
    .end()
}
// @ts-ignore
const api = (_, res) => {
  res
    .status(200)
    .end(
      'This is the programmatic API to create NFTs and Native Tokens on the Cardano blockchain. See the documentation here: https://cardano-nft.de/docs '
    )
}

export { root, api }
