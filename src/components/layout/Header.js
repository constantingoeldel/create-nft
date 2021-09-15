import React from 'react';
import AnchorLink from 'react-anchor-link-smooth-scroll';
import Button from '../Button';
import Logo from '../../svg/Logo'
import { PopupButton } from '@typeform/embed-react';

const Header = () => (
  <header className="sticky top-0 bg-white shadow">
    <div className="container flex flex-col sm:flex-row justify-between items-center mx-auto py-4 px-8">
      <Logo />
      <div className="flex mt-4 sm:mt-0">
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
        <Button className="text-sm"><PopupButton id="AqmhHkBs">Start creating</PopupButton></Button>
      </div>
    </div>
  </header>
);

export default Header;
