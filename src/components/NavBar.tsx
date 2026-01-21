'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { NavDropdown } from './NavDropdown';
import Image from 'next/image';

export function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  return (
    <nav className="bg-[#F97352] text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left Side: Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="font-bold text-xl tracking-tight">
              Kantin Sanjose
            </Link>
          </div>

          {/* Right Side: Navigation & Profile */}
          <div className="flex items-center gap-4 md:gap-6">
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6 text-sm font-medium h-16">
              <Link href="/myOrders" className="hover:text-amber-100 transition-colors">
                My Orders
              </Link>
              <Link href="/manageMenu" className="hover:text-amber-100 transition-colors">
                Manage Menu
              </Link>
              <Link href="/about" className="hover:text-amber-100 transition-colors">
                About
              </Link>
            </div>

            {/* Auth Section */}
            {status === 'loading' ? (
              <div className="h-8 w-8 rounded-full bg-white/20 animate-pulse" />
            ) : session?.user ? (
              <div className="relative group">
                <button className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border border-white/30 cursor-pointer hover:bg-white/30 transition-colors">
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                {/* Dropdown */}
                <div className="absolute top-full right-0 mt-0 w-48 bg-white rounded-md shadow-lg py-1 text-gray-800 transition-all duration-200 ease-out origin-top-right transform opacity-0 scale-95 invisible group-hover:opacity-100 group-hover:scale-100 group-hover:visible">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">{session.user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                  </div>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-sm hover:bg-orange-50 hover:text-[#F97352] transition-colors"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-orange-50 hover:text-[#F97352] transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="px-4 py-2 bg-white text-[#F97352] rounded-md text-sm font-medium hover:bg-orange-50 transition-colors"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-white/20 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown with Animation */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-t border-white/10 bg-[#F97352] px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link 
            href="/myOrders" 
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-white/10 transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            My Orders
          </Link>
          <Link 
            href="/manageMenu" 
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-white/10 transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Manage Menu
          </Link>
          <Link 
            href="/about" 
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-white/10 transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            About
          </Link>
          {session?.user ? (
            <button
              onClick={() => {
                signOut();
                setIsMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-white/10 transition-colors"
            >
              Sign Out
            </button>
          ) : (
            <Link 
              href="/auth/signin" 
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-white/10 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
