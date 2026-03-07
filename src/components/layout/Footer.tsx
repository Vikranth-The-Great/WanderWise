import Link from 'next/link';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone } from 'react-icons/fa';
import { useState } from 'react';

/**
 * Application footer component.
 * Displays copyright, links, and contact information.
 */
const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  return (
    <footer className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white py-16 relative border-t border-blue-500/30 shadow-2xl">
      {/* Subtle backdrop blur effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/95 via-indigo-600/95 to-blue-700/95 backdrop-blur-sm"></div>

      {/* Top border highlight */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {/* About / Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-white/20 to-white/10 rounded-xl flex items-center justify-center shadow-lg border border-white/20">
                <span className="text-white font-bold text-xl">AI</span>
              </div>
              <h3 className="text-2xl font-bold text-white">
                AI Itinerary
              </h3>
            </div>
            <p className="text-white/90 leading-relaxed">
              Your intelligent travel companion. We harness the power of AI to create personalized itineraries that perfectly match your preferences, budget, and travel dreams.
            </p>
            {/* Social Media Icons */}
            <div className="flex space-x-3 pt-2">
              <Link href="#" className="group">
                <div className="w-10 h-10 border border-white/30 rounded-lg flex items-center justify-center text-white/80 hover:border-white hover:bg-white/10 hover:text-white transition-all duration-300 hover:scale-105">
                  <FaFacebook size={18} />
                </div>
              </Link>
              <Link href="#" className="group">
                <div className="w-10 h-10 border border-white/30 rounded-lg flex items-center justify-center text-white/80 hover:border-white hover:bg-white/10 hover:text-white transition-all duration-300 hover:scale-105">
                  <FaTwitter size={18} />
                </div>
              </Link>
              <Link href="#" className="group">
                <div className="w-10 h-10 border border-white/30 rounded-lg flex items-center justify-center text-white/80 hover:border-white hover:bg-white/10 hover:text-white transition-all duration-300 hover:scale-105">
                  <FaInstagram size={18} />
                </div>
              </Link>
              <Link href="#" className="group">
                <div className="w-10 h-10 border border-white/30 rounded-lg flex items-center justify-center text-white/80 hover:border-white hover:bg-white/10 hover:text-white transition-all duration-300 hover:scale-105">
                  <FaLinkedin size={18} />
                </div>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-xl font-semibold text-white">Quick Links</h4>
            <div className="w-12 h-0.5 bg-white/30 rounded-full"></div>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-white/90 hover:text-white transition-all duration-300 relative group">
                  <span className="relative z-10">Home</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
                </Link>
              </li>
              <li>
                <Link href="/blogs" className="text-white/90 hover:text-white transition-all duration-300 relative group">
                  <span className="relative z-10">Blogs</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/90 hover:text-white transition-all duration-300 relative group">
                  <span className="relative z-10">Contact</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-white/90 hover:text-white transition-all duration-300 relative group">
                  <span className="relative z-10">About</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h4 className="text-xl font-semibold text-white">Contact Us</h4>
            <div className="w-12 h-0.5 bg-white/30 rounded-full"></div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 group cursor-pointer">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white/80 group-hover:bg-white/20 group-hover:text-white transition-all duration-300 border border-white/20">
                  <FaEnvelope size={16} />
                </div>
                <div>
                  <p className="text-white/90 group-hover:text-white transition-colors duration-300">
                    hello@aiitinerary.com
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 group cursor-pointer">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white/80 group-hover:bg-white/20 group-hover:text-white transition-all duration-300 border border-white/20">
                  <FaPhone size={16} />
                </div>
                <div>
                  <p className="text-white/90 group-hover:text-white transition-colors duration-300">
                    +1 (555) 123-4567
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <div className="max-w-2xl mx-auto text-center">
            <h4 className="text-xl font-semibold text-white mb-3">Stay Updated</h4>
            <p className="text-white/90 mb-6">Get travel tips, destination guides, and exclusive offers delivered to your inbox.</p>

            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20 transition-all duration-300"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg border border-white/30 hover:border-white transition-all duration-300 hover:scale-105"
              >
                {isSubscribed ? '✓ Subscribed!' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-16 pt-8 border-t border-white/20">
          <div className="text-center">
            <p className="text-white text-sm">
              © 2024 TravelAI. All rights reserved. Crafted with ❤️ for travelers worldwide.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;