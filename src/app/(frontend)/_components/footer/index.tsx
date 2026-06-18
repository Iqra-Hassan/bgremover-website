'use client';

import Logo from '@/app/admin/_components/sidebar/logo';
import { useSettings } from '@/components/settings-provider';
import Link from 'next/link';
import React from 'react';
import { FaFacebookF, FaXTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa6';

const menuLinks = [
  { name: 'Pricing', href: '/pricing' },
  { name: 'Blog', href: '/blog' },
  { name: 'Privacy Policy', href: '/privacy-policy' },
  { name: 'Terms of Service', href: '/terms-of-service' },
  { name: 'Contact', href: '/contact' },
];

const socialLinks = [
  { name: 'Facebook', icon: FaFacebookF, href: '#' },
  { name: 'X', icon: FaXTwitter, href: '#' },
  { name: 'Instagram', icon: FaInstagram, href: '#' },
  { name: 'LinkedIn', icon: FaLinkedinIn, href: '#' },
];

function Footer() {
  const settings = useSettings();
  return (
    <footer className="from-primary/10 relative mx-auto mt-10 flex w-full flex-col items-center justify-center border-t bg-gradient-to-t to-transparent px-6 py-12 lg:py-16">
      <div className="flex flex-col items-center justify-center space-y-6 text-center">
        <Logo />
        <div className="flex flex-wrap gap-4 pt-2">
          {socialLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-background hover:bg-primary/10 group flex size-9 items-center justify-center rounded-full shadow-sm transition-colors duration-200"
            >
              <link.icon className="text-gray group-hover:text-foreground size-4" />
            </a>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6">
          {menuLinks.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="text-gray hover:text-primary text-sm transition-colors duration-200"
            >
              {link.name}
            </Link>
          ))}
        </div>
        <p className="text-gray text-sm md:mt-0">
          © {new Date().getFullYear()} {settings?.general?.applicationName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
