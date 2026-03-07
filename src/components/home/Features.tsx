'use client';

import { motion } from 'framer-motion';
import { FiMapPin, FiCalendar, FiList } from 'react-icons/fi';

/**
 * Features section component displaying the application's core capabilities.
 * Lists key steps/benefits with icons and descriptions.
 */
const Features = () => {
  const features = [
    {
      icon: <FiMapPin className="text-accent text-4xl" />,
      title: 'Choose Destination',
      description: 'Select from thousands of destinations worldwide. Our AI knows the best spots in each location.',
    },
    {
      icon: <FiCalendar className="text-accent text-4xl" />,
      title: 'Set Your Dates',
      description: "Tell us when you're traveling. Our calendar makes it easy to visualize your trip duration.",
    },
    {
      icon: <FiList className="text-accent text-4xl" />,
      title: 'Get Your Itinerary',
      description: 'Receive a personalized day-by-day plan with attractions, restaurants, and activities.',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">How It Works</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Planning your trip has never been easier. Our AI-powered platform creates personalized itineraries in just three simple steps.
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-lg p-8 shadow-lg text-center hover:shadow-xl transition-shadow duration-300"
              variants={itemVariants}
            >
              <div className="flex justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;