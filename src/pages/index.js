import React from 'react'
import Button from '../components/Button'
import Card from '../components/Card'
import CustomerCard from '../components/CustomerCard'
import LabelText from '../components/LabelText'
import Layout from '../components/layout/Layout'
import SplitSection from '../components/SplitSection'
import StatsBox from '../components/StatsBox'
import HeroImage from '../svg/HeroImage'
import SvgCharts from '../svg/SvgCharts'
import Header from '../components/layout/Header'
import SEO from '../components/SEO'
import Form from '../components/form/Form'
import { useState } from 'react'
import { CopyBlock, atomOneDark } from 'react-code-blocks'
import send from '../svg/send.png'
import AnchorLink from 'react-anchor-link-smooth-scroll'

const Index = () => {
  const [input, setInput] = useState({
    author: '',
    description: '',
    symbol: '',
    amount: 1,
    description: '',
    name: '',
  })

  return (
    <>
      <SEO />
      <Header />
      <section className="pt-10 sm:pt-20 ">
        <div className="container mx-auto px-8 ">
          <div className="text-center ">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-none">
              The easiest way to create your own NFTs on Cardano
            </h1>
            <p className="text-l sm:text-xl lg:text-2xl mt-6 font-light" id="create">
              It will take just 5 minutes, no prior knowledge required. Payment via ADA or credit
              card.
            </p>
          </div>

          <Form input={input} setInput={setInput} />
        </div>
        <div className="container mx-auto px-8 lg:flex relative z-0 "></div>
      </section>
      <section id="features" className="py-20">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl lg:text-5xl font-semibold">Main Features</h2>
          <div className="flex flex-col sm:flex-row sm:-mx-3 mt-12">
            <div className="flex-1 px-3">
              <Card className="mb-8">
                <p className="font-semibold text-xl">Easy</p>
                <p className="mt-4">
                  Don't have any experience with NFTs or crypto? No problem! The process is simple
                  and you can even pay with a credit card!
                </p>
              </Card>
            </div>
            <div className="flex-1 px-3">
              <Card className="mb-8">
                <p className="font-semibold text-xl">Fast</p>
                <p className="mt-4">
                  You will have your NFT in less than 5 minutes. If anything goes wrong, you can
                  personally contact me and we will sort it out
                </p>
              </Card>
            </div>
            <div className="flex-1 px-3">
              <Card className="mb-8">
                <p className="font-semibold text-xl">Versatile</p>
                <p className="mt-4">
                  You can add all sorts of pictures, videos and audio files to your NFT. For native
                  tokens, you can create as many as you can dream of!
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>
      <div className="container mx-auto text-center mb-5">
        <h2 className="text-3xl lg:text-5xl font-semibold">API</h2>
      </div>
      <div className="container mx-auto  mb-5">
        <p className="text-l sm:text-xl lg:text-2xl mt-6">
          You can also use our API, it is currently completely free to use, only transaction costs
          added:
        </p>
        <ul className="list-decimal pl-6">
          <li>Create a new wallet and token</li>
          <li>Send some ADA to the wallet </li>
          <li>Mint a token or NFT exactly how you want it</li>
        </ul>
      </div>
      <section className="container mx-auto">
        <p className="text-l sm:text-xl lg:text-2xl my-3">Create token </p>
        <CopyBlock
          language="js"
          theme={atomOneDark}
          text={`fetch("https://api.cardano-nft.de/v0/new")
          .then(response => response.text())
          .then(result => console.log(result))
          .catch(error => console.log('error', error)); 

// Return value
  {
    "paymentAddr": "addr1v9ptstftfxz2hnkffwldl04tju7y0uyq2ucyqqzphu65hqqjjravl",
    "token": "ZgdFvtV87qGD1UDwIjart"
  } `}
        />{' '}
      </section>
      <section className="container mx-auto">
        <p className="text-l sm:text-xl lg:text-2xl my-3">Send some ADA to your new wallet </p>
        <img src={send} alt="Transfer ADA to the wallet" />
      </section>
      <section className="container mx-auto">
        <p className="text-l sm:text-xl lg:text-2xl my-3">Mint your NFT </p>
        <CopyBlock
          language="js"
          theme={atomOneDark}
          text={`const raw = JSON.stringify({
  "auth": "TOKEN",
  "amount": 20 // Not necessary for NFTs 
  "properties": {
    "name": "NAME",
    "x": "up to ten other properties as strings",
    "y": "like this, you choose the property name"
  }
});

const requestOptions = {
  method: 'POST',
  headers: headers,
  body: raw,
  redirect: 'follow'
};

fetch("https://api.cardano-nft.de/v0/create/nft", requestOptions) // Or /token for fungible tokens
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));`}
        />{' '}
      </section>
      <div className="container mx-auto text-center mt-5">
        <h2 className="text-3xl lg:text-5xl font-semibold">How it works</h2>
      </div>

      <SplitSection
        id="how"
        primarySlot={
          <div className="lg:pr-32 xl:pr-48">
            <h3 className="text-3xl font-semibold leading-tight">Add information</h3>
            <p className="mt-8 text-xl font-light leading-relaxed">
              Select between NFT and native token and add details like the name, the symbol, and a
              description of your new asset.
            </p>
          </div>
        }
        secondarySlot={<SvgCharts />}
      />
      <SplitSection
        reverseOrder
        primarySlot={
          <div className="lg:pl-32 xl:pl-48">
            <h3 className="text-3xl font-semibold leading-tight">Upload media</h3>
            <p className="mt-8 text-xl font-light leading-relaxed">
              We will store whatever you send us, it can be audio, videos or pictures. These are
              forever connected to your NFT.
            </p>
          </div>
        }
        secondarySlot={<SvgCharts />}
      />
      <SplitSection
        primarySlot={
          <div className="lg:pr-32 xl:pr-48">
            <h3 className="text-3xl font-semibold leading-tight">
              Connect a wallet and pay for transaction fees
            </h3>
            <p className="mt-8 text-xl font-light leading-relaxed">
              Enter the wallet that the token will be sent to. Then select between paying with ADA
              or with credit card to cover the cost of creating and sending your NFT.
            </p>
          </div>
        }
        secondarySlot={<SvgCharts />}
      />

      {/* <section id="stats" className="py-20 lg:pt-32">
      <div className="container mx-auto text-center">
        <LabelText className="text-gray-600">Our customers get results</LabelText>
        <div className="flex flex-col sm:flex-row mt-8 lg:px-24">
          <div className="w-full sm:w-1/3">
            <StatsBox primaryText="+100%" secondaryText="Stats Information" />
          </div>
          <div className="w-full sm:w-1/3">
            <StatsBox primaryText="+100%" secondaryText="Stats Information" />
          </div>
          <div className="w-full sm:w-1/3">
            <StatsBox primaryText="+100%" secondaryText="Stats Information" />
          </div>
        </div>
      </div>
    </section> */}
      {/* <section id="testimonials" className="py-20 lg:py-40">
      <div className="container mx-auto">
        <LabelText className="mb-8 text-gray-600 text-center">What customers are saying</LabelText>
        <div className="flex flex-col md:flex-row md:-mx-3">
          {customerData.map(customer => (
            <div key={customer.customerName} className="flex-1 px-3">
              <CustomerCard customer={customer} />
            </div>
          ))}
        </div>
      </div>
    </section> */}

      <section className="container mx-auto my-20 py-24 bg-gray-200 rounded-lg text-center">
        <h3 className="text-5xl font-semibold">Ready to create your NFT?</h3>
        <p className="mt-8 text-xl font-light">
          Everything until the final confirmation is easily reversible, no hidden costs.
        </p>
        <AnchorLink href="#create">
          <Button className="mt-8">Start creating</Button>
        </AnchorLink>
      </section>
    </>
  )
}

export default Index
