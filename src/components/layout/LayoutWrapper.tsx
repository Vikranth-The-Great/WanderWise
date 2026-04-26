'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiUser, FiSettings, FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

/**
 * Wrapper component for the application layout.
 * conditionally renders the Navbar and Footer based on the current path.
 * 
 * @param props - Layout wrapper properties including children.
 */
export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Define pages that should NOT have navbar (preference setting pages)
  const noNavbarPages = [
    '/generate-itinerary',
    '/traveler-type',
    '/budget',
    '/category',
    '/travel-theme',
    '/quick-itinerary',
    '/custom-planning'
  ];

  // Define pages that should have navbar but without certain navigation links
  const noNavLinksPages = [
    '/itinerary-results',
    '/custom-planning/itinerary-customization'
  ];

  // Don't show navbar on preference setting pages
  if (noNavbarPages.includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <>
      <header className="bg-gradient-to-r from-sky-100 via-blue-100 to-purple-100 text-gray-800 shadow-lg backdrop-blur-md border-b border-gray-300/30">
        <nav className={`container mx-auto px-6 lg:px-8 flex justify-between items-center relative ${pathname === '/custom-planning/itinerary-customization' ? 'py-2' : 'py-4'
          }`}>
          {/* Logo */}
          <div className="flex items-center z-10">
            <Image
              src="/images/partners/viva-logo.jpg"
              alt="Viva Logo"
              width={100}
              height={48}
              className="h-12 w-auto mr-3 rounded-lg shadow-lg"
            />

          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center justify-center flex-1">
            {!noNavLinksPages.includes(pathname) && (
              <div className="flex items-center space-x-8">
                <Link href="/" className="relative text-gray-700 hover:text-blue-600 font-semibold text-lg transition-all duration-300 group">
                  Home
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link href="/blogs" className="relative text-gray-700 hover:text-blue-600 font-semibold text-lg transition-all duration-300 group">
                  Blogs
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link href="/contact" className="relative text-gray-700 hover:text-blue-600 font-semibold text-lg transition-all duration-300 group">
                  Contact
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link href="/about" className="relative text-gray-700 hover:text-blue-600 font-semibold text-lg transition-all duration-300 group">
                  About
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </div>
            )}
          </div>

          {/* Desktop User Actions */}
          <div className="hidden lg:flex items-center space-x-3 z-10">
            <button className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 p-2 rounded border border-gray-300 hover:border-blue-400 group">
              <FiUser size={20} className="group-hover:scale-110 transition-transform duration-300" />
            </button>
            <button className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 p-2 rounded border border-gray-300 hover:border-blue-400 group">
              <FiSettings size={20} className="group-hover:scale-110 transition-transform duration-300" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 p-3 rounded-xl backdrop-blur-sm border border-gray-200 hover:border-blue-300 z-10"
          >
            {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </nav>

        {/* Mobile Menu */}
        <div className={`lg:hidden absolute top-full left-0 right-0 bg-gradient-to-b from-white/95 to-blue-50/95 backdrop-blur-lg border-b border-gray-200/50 transition-all duration-300 z-50 ${isMobileMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-4'}`}>
          <div className="container mx-auto px-6 py-6 space-y-4">
            {!noNavLinksPages.includes(pathname) && (
              <>
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 py-3 px-4 rounded-lg hover:bg-blue-50"
                >
                  Home
                </Link>
                <Link
                  href="/blogs"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-white/90 hover:text-white font-medium transition-all duration-300 py-3 px-4 rounded-lg hover:bg-white/10"
                >
                  Blogs
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-white/90 hover:text-white font-medium transition-all duration-300 py-3 px-4 rounded-lg hover:bg-white/10"
                >
                  Contact
                </Link>
                <Link
                  href="/about"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-white/90 hover:text-white font-medium transition-all duration-300 py-3 px-4 rounded-lg hover:bg-white/10"
                >
                  About
                </Link>
              </>
            )}
            <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
              <button className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 p-2 rounded border border-gray-300 hover:border-blue-400">
                <FiUser size={20} />
              </button>
              <button className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 p-2 rounded border border-gray-300 hover:border-blue-400">
                <FiSettings size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="relative" style={{ backgroundColor: '#0D1B3D' }}>
        {/* Gradient overlay top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-500"></div>

        <div className="container-custom py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* About Section */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white mb-4">TravelAI</h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                Smarter, faster, better travel planning with AI.
              </p>
              <p className="text-gray-400 leading-relaxed text-sm">
                Plan your perfect trip with AI assistance. We make travel planning easy and personalized.
              </p>

              {/* Social Media Icons */}
              <div className="flex space-x-4 pt-4">
                <a href="#" className="text-white hover:text-cyan-400 transition-colors duration-200">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-cyan-400 transition-colors duration-200">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-cyan-400 transition-colors duration-200">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z" />
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-cyan-400 transition-colors duration-200">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links Section */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white mb-6">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/" className="text-gray-300 hover:text-cyan-400 hover:underline transition-all duration-200 flex items-center group">
                    <span className="mr-2 group-hover:scale-110 transition-transform duration-200">🏠</span>
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/blogs" className="text-gray-300 hover:text-cyan-400 hover:underline transition-all duration-200 flex items-center group">
                    <span className="mr-2 group-hover:scale-110 transition-transform duration-200">✍️</span>
                    Blogs
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-300 hover:text-cyan-400 hover:underline transition-all duration-200 flex items-center group">
                    <span className="mr-2 group-hover:scale-110 transition-transform duration-200">✉️</span>
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-300 hover:text-cyan-400 hover:underline transition-all duration-200 flex items-center group">
                    <span className="mr-2 group-hover:scale-110 transition-transform duration-200">ℹ️</span>
                    About Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Section */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white mb-6">Contact Us</h3>
              <div className="space-y-3">
                <div className="flex items-center group">
                  <span className="mr-3 text-lg group-hover:scale-110 transition-transform duration-200">📧</span>
                  <a href="mailto:info@travelai.com" className="text-gray-300 hover:text-cyan-400 transition-colors duration-200">
                    info@travelai.com
                  </a>
                </div>
                <div className="flex items-center group">
                  <span className="mr-3 text-lg group-hover:scale-110 transition-transform duration-200">📞</span>
                  <a href="tel:+15551234567" className="text-gray-300 hover:text-cyan-400 transition-colors duration-200">
                    +1 (555) 123-4567
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Divider line for mobile */}
          <div className="block md:hidden border-t border-gray-600 my-8"></div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-600" style={{ backgroundColor: '#0A1529' }}>
          <div className="container-custom py-4">
            <div className="text-center text-gray-400 text-sm">
              <p>&copy; 2025 TravelAI. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}