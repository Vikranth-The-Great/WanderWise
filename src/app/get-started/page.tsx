'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiEdit } from 'react-icons/fi';
import { FaBrain } from 'react-icons/fa';

/**
 * Get Started page component.
 * Presents users with options to choose between Quick AI Itinerary and Manual Planning.
 */
export default function GetStarted() {
  const options = [
    {
      icon: <FaBrain className="text-accent text-5xl" />,
      title: 'Quick AI Itinerary',
      description: 'Let our AI create a complete itinerary based on your destination and dates. Perfect for travelers who want a ready-to-go plan with minimal input.',
      link: '/quick-itinerary',
      buttonText: 'Get Started',
      color: 'bg-primary',
    },
    {
      icon: <FiEdit className="text-accent text-5xl" />,
      title: 'Manual Planning',
      description: 'Build your itinerary step by step with AI assistance. Ideal for travelers who want more control over their daily activities and schedule.',
      link: '/manual-planning',
      buttonText: 'Start Planning',
      color: 'bg-primary/80',
    },
  ];

  return (
    <main className="min-h-screen py-20 bg-light-bg">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">Choose Your Planning Style</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We offer two ways to create your perfect travel itinerary. Select the option that best fits your planning style.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {options.map((option, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className={`${option.color} p-10 flex items-center justify-center`}>
                <div className="bg-white/10 w-20 h-20 rounded-full flex items-center justify-center">
                  {option.icon}
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-semibold text-primary mb-4 text-center">{option.title}</h3>
                <p className="text-gray-600 mb-8 text-center">{option.description}</p>
                <div className="flex justify-center">
                  <Link
                    href={option.link}
                    className={index === 0 ? 'btn-accent' : 'btn-secondary'}
                  >
                    {option.buttonText}
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}