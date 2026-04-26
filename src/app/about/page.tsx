'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

/**
 * About page component.
 * Displays information about the company, founders, mission, and timeline.
 */
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 opacity-90"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>
        </div>

        {/* Hero Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Our Journey, Your Adventure
          </h1>
          <p className="text-xl md:text-2xl font-light opacity-90 max-w-2xl mx-auto">
            We built this app to make traveling smarter, easier, and unforgettable.
          </p>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-3 bg-white/70 rounded-full mt-2"
            />
          </div>
        </motion.div>
      </section>

      {/* Founders Section */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="container-custom max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">Meet Our Founders</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Passionate travelers and tech enthusiasts who believe in making every journey extraordinary.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* Founder */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center group"
            >
              <div className="relative mb-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="relative w-48 h-48 mx-auto rounded-full overflow-hidden shadow-2xl border-4 border-white"
                >
                  <Image
                    src="/images/team/Founder.jpg"
                    alt="Vaibhav B - Founder"
                    fill
                    style={{ objectFit: 'cover' }}
                    className="group-hover:scale-110 transition-transform duration-300"
                  />
                </motion.div>
                {/* Abstract travel elements */}
                <div className="absolute -top-4 -right-4 w-12 h-12 text-orange-500 opacity-20">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-2">Vaibhav B</h3>
              <p className="text-orange-500 font-semibold mb-4">Founder</p>
              <p className="text-gray-600 leading-relaxed">
                A passionate traveler and tech visionary who believes in the power of AI to transform how we explore the world. With a background in software engineering and a love for adventure.
              </p>
            </motion.div>

            {/* Co-Founder */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-center group"
            >
              <div className="relative mb-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="relative w-48 h-48 mx-auto rounded-full overflow-hidden shadow-2xl border-4 border-white"
                >
                  <Image
                    src="/images/team/Co-Founder.jpg"
                    alt="Vikranth S - Co-Founder"
                    fill
                    style={{ objectFit: 'cover' }}
                    className="group-hover:scale-110 transition-transform duration-300"
                  />
                </motion.div>
                {/* Abstract travel elements */}
                <div className="absolute -top-4 -left-4 w-12 h-12 text-orange-500 opacity-20">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21,16V14L13,9V7A3,3 0 0,0 10,4A3,3 0 0,0 7,7V9L-1,14V16L7,13.5V19L5,20.5V22L10,21L15,22V20.5L13,19V13.5L21,16Z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-2">Vikranth S</h3>
              <p className="text-orange-500 font-semibold mb-4">Co-Founder</p>
              <p className="text-gray-600 leading-relaxed">
                An innovative developer and travel enthusiast dedicated to creating seamless user experiences. Combines technical expertise with a deep understanding of traveler needs.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 bg-white">
        <div className="container-custom max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Mission */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center p-8 bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-lg border border-blue-100"
            >
              <div className="text-6xl mb-6">🗺️</div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                To redefine travel planning with AI-powered experiences, making every trip seamless and joyful.
              </p>
            </motion.div>

            {/* Vision */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center p-8 bg-gradient-to-br from-orange-50 to-white rounded-2xl shadow-lg border border-orange-100"
            >
              <div className="text-6xl mb-6">🌍</div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                A world where every traveler has their personal guide in their pocket.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="container-custom max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">Our Journey</h2>
            <p className="text-xl text-gray-600">
              From idea to reality - the story of how we&apos;re revolutionizing travel planning.
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-orange-500 to-blue-900 opacity-30"></div>

            {/* Timeline Items */}
            <div className="space-y-12">
              {/* Idea */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="flex items-center"
              >
                <div className="flex-1 text-right pr-8">
                  <h4 className="text-xl font-bold text-blue-900 mb-2">The Spark</h4>
                  <p className="text-gray-600">Frustrated with complex travel planning, we envisioned an AI-powered solution.</p>
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white text-xl z-10">
                  💡
                </div>
                <div className="flex-1 pl-8"></div>
              </motion.div>

              {/* Development */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="flex items-center"
              >
                <div className="flex-1 pr-8"></div>
                <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center text-white text-xl z-10">
                  ⚡
                </div>
                <div className="flex-1 text-left pl-8">
                  <h4 className="text-xl font-bold text-blue-900 mb-2">Building the Dream</h4>
                  <p className="text-gray-600">Months of development, testing, and refining to create the perfect travel companion.</p>
                </div>
              </motion.div>

              {/* Launch */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="flex items-center"
              >
                <div className="flex-1 text-right pr-8">
                  <h4 className="text-xl font-bold text-blue-900 mb-2">Launch & Beyond</h4>
                  <p className="text-gray-600">Bringing AI-powered travel planning to adventurers worldwide.</p>
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white text-xl z-10">
                  🚀
                </div>
                <div className="flex-1 pl-8"></div>
              </motion.div>

              {/* Future */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
                className="flex items-center"
              >
                <div className="flex-1 pr-8"></div>
                <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center text-white text-xl z-10">
                  ✨
                </div>
                <div className="flex-1 text-left pl-8">
                  <h4 className="text-xl font-bold text-blue-900 mb-2">The Future</h4>
                  <p className="text-gray-600">Expanding features, partnerships, and making travel planning even more magical.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}