'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

/**
 * Call-to-action section component.
 * Encourages users to start planning their trip.
 */
const CTA = () => {
  return (
    <section className="py-20 bg-primary relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-accent -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-accent translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Plan Your Dream Vacation?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Join thousands of travelers who have discovered the perfect way to plan their trips.
            Our AI-powered itinerary planner is waiting to create your personalized adventure.
          </p>
          <Link
            href="/get-started"
            className="btn-accent text-lg px-8 py-4 inline-block"
          >
            Start Planning Now
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;