'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

/**
 * Hero section component for the landing page.
 * Features a background image, main headline, and call-to-action button.
 */
const Hero = () => {
  return (
    <div className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/home-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#1E3A8A', // Fallback color if image fails to load
        }}
      />

      {/* Content */}
      <div className="container mx-auto px-4 z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Plan Your Perfect Trip with AI
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Create personalized travel itineraries in seconds with our AI-powered planning tool.
            Just tell us where and when - we'll handle the rest.
          </p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Link
              href="/get-started"
              className="btn-accent text-lg px-8 py-4"
            >
              Get Started
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <motion.div
        className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-white to-transparent z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      />
    </div>
  );
};

export default Hero;