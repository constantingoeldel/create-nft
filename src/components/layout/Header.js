import React from 'react'
import AnchorLink from 'react-anchor-link-smooth-scroll'
import Button from '../Button'
import Logo from '../../svg/Logo'
import { PopupButton } from '@typeform/embed-react'

const Header = ({ price = 10, id = '100' }) => (
  <header className="sticky top-0 bg-white shadow">
    <div className="container flex flex-row justify-between items-center mx-auto sm:py-4 px-8">
      <Logo />
      <div className="hidden sm:flex mt-4 sm:mt-0">
        <AnchorLink className="px-4" href="#features">
          Features
        </AnchorLink>
        <AnchorLink className="px-4" href="#how">
          How it works
        </AnchorLink>
        {/* <AnchorLink className="px-4" href="#stats">
          Stats
        </AnchorLink>
        <AnchorLink className="px-4" href="#testimonials">
          Testimonials
        </AnchorLink> */}
      </div>
      <div className="hidden md:block">
        <PopupButton
          className="bg-primary
        hover:bg-primary-darker
        rounded
        text-white py-3 px-8"
          id="AqmhHkBs"
          hidden={{ adaprice: price.toString(), id: id }}
        >
          Start creating
        </PopupButton>
      </div>
    </div>
  </header>
)

export default Header
