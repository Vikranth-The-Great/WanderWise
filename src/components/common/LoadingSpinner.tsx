'use client';

import { motion } from 'framer-motion';

/**
 * A reusable loading spinner component.
 * Displays a rotating dashed circle to indicate processing state.
 */
const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
      <motion.div
        className="flex flex-col items-center space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <p className="text-blue-600 font-medium">Loading...</p>
      </motion.div>
    </div>
  );
};

export default LoadingSpinner;