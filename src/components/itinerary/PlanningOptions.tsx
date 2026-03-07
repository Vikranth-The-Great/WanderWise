'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiEdit } from 'react-icons/fi';
import { FaBrain } from 'react-icons/fa';

/**
 * Component for selecting the itinerary planning mode.
 * Offers choices between Quick AI planning and Manual planning.
 */
const PlanningOptions = () => {
  const options = [
    {
      icon: <FaBrain className="text-accent text-5xl" />,
      title: 'Quick AI Itinerary',
      description: 'Let our AI create a complete itinerary based on your destination and dates. Perfect for travelers who want a ready-to-go plan with minimal input.',
      link: '/quick-itinerary',
      buttonText: 'Get Started',
    },
    {
      icon: <FiEdit className="text-accent text-5xl" />,
      title: 'Manual Planning',
      description: 'Build your itinerary step by step with AI assistance. Ideal for travelers who want more control over their daily activities and schedule.',
      link: '/manual-planning',
      buttonText: 'Start Planning',
    },
  ];

  return (
    <section className="py-20 bg-light-bg">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Choose Your Planning Style</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We offer two ways to create your perfect travel itinerary. Select the option that best fits your planning style.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {options.map((option, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-8">
                <div className="flex justify-center mb-6">
                  {option.icon}
                </div>
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
    </section>
  );
};

export default PlanningOptions;