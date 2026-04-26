'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { FiStar } from 'react-icons/fi';

/**
 * Testimonials section component.
 * Displays user reviews and ratings to build trust.
 */
const Testimonials = () => {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      location: 'Paris, France',
      quote: 'The AI itinerary saved me hours of planning. It suggested places I never would have found on my own!',
      rating: 5,
      image: 'https://randomuser.me/api/portraits/women/32.jpg',
    },
    {
      name: 'Michael Chen',
      location: 'Tokyo, Japan',
      quote: 'As a frequent traveler, I\'ve tried many planning tools. This is by far the most intuitive and accurate.',
      rating: 5,
      image: 'https://randomuser.me/api/portraits/men/51.jpg',
    },
    {
      name: 'Emma Rodriguez',
      location: 'Barcelona, Spain',
      quote: 'I was skeptical about AI planning my trip, but the itinerary was perfectly balanced with activities I love.',
      rating: 4,
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">What Our Travelers Say</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Don&apos;t just take our word for it. Here&apos;s what travelers have experienced with our AI itinerary planner.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
            >
              <div className="flex items-center mb-4">
                <Image
                  src={testimonial.image}
                  alt={testimonial.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full mr-4 object-cover"
                />
                <div>
                  <h4 className="font-semibold text-primary">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.location}</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    className={`${i < testimonial.rating ? 'text-accent' : 'text-gray-300'} fill-current`}
                  />
                ))}
              </div>
              <p className="text-gray-600 italic">{testimonial.quote}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
