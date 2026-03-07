'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiMenu, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';

/**
 * Navigation bar component.
 * Provides links to main pages and handles mobile responsiveness.
 */
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-lg border-b border-white/20">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Image
              src="/logo.jpg"
              alt="TravelAI"
              width={50}
              height={50}
              className="w-12 h-12 rounded-lg"
            />
            <span className="ml-3 text-xl font-bold text-primary">TravelAI</span>
          </div>

          {/* Centered Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-white hover:text-orange-300 transition-colors font-medium">
                Home
              </Link>
              <Link href="/blogs" className="text-white hover:text-orange-300 transition-colors font-medium">
                Blogs
              </Link>
              <Link href="/about" className="text-white hover:text-orange-300 transition-colors font-medium">
                About
              </Link>
              <Link href="/contact" className="text-white hover:text-orange-300 transition-colors font-medium">
                Contact
              </Link>
            </div>
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link href="/get-started">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white font-bold px-6 py-3 rounded-full shadow-lg transition-all duration-300"
              >
                Get Started
              </motion.button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 p-2"
              aria-label="Toggle menu"
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-white/20 transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className="px-4 py-6 space-y-4">
          <Link href="/" className="block text-gray-700 hover:text-primary font-medium transition-colors py-2">
            Home
          </Link>
          <Link href="/blogs" className="block text-gray-700 hover:text-primary font-medium transition-colors py-2">
            Blogs
          </Link>
          <Link href="/about" className="block text-gray-700 hover:text-primary font-medium transition-colors py-2">
            About
          </Link>
          <Link href="/contact" className="block text-gray-700 hover:text-primary font-medium transition-colors py-2">
            Contact
          </Link>
          <Link href="/get-started" className="block">
            <button className="w-full bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white font-bold px-6 py-3 rounded-full shadow-lg transition-all duration-300">
              Get Started
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;