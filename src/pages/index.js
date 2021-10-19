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
import { v4 as uuid } from 'uuid'
import SEO from '../components/SEO'
import Form from '../components/form/Form'

const Index = () => {
  const price = (1 + Math.random()).toFixed(4)
  const id = uuid()

  return (
    <>
      <SEO />
      <Header price={price} id={id} />
      <section className="pt-10 sm:pt-20 ">
        <div className="container mx-auto px-8 ">
          <div className="text-center ">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-none">
              The easiest way to create your own NFTs on Cardano
            </h1>
            <p className="text-l sm:text-xl lg:text-2xl mt-6 font-light">
              It will take just 5 minutes, no prior knowledge required. Payment via ADA or credit
              card.
            </p>
          </div>
          <Form price={price} id={id} />
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
      <div className="container mx-auto text-center">
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
        <Button className="mt-8">Start creating</Button>
      </section>
    </>
  )
}

export default Index
