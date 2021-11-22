require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`,
})
module.exports = {
  siteMetadata: {
    title: `Cardano NFT - mint NFTs and create native tokens`,
    url: `https://cardano-nft.de`,
    description: `The easiest way to create your own NFTs on the cardano blockchain. Mint custom tokens and native assets with ADA or credit card.`,
    image: '/images/favicon.svg',
    twitterUsername: 'cgoeldel',
    titleTemplate: '%s · NFT Creator',
  },
  plugins: [
    'gatsby-plugin-react-helmet',
    {
      resolve: `gatsby-theme-codebushi`,
      options: {
        tailwindConfig: `tailwind.config.js`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: 'images',
        path: `${__dirname}/src/svg`,
        image: 'favicon.svg',
      },
    },
  ],
}
