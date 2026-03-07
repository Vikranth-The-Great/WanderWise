'use client';

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FaPlane, FaMapMarkedAlt, FaCalendarAlt, FaUser } from "react-icons/fa";
import { useMemo, useCallback } from 'react';

/**
 * Home page component.
 * Landing page featuring hero section, features, testimonials, and call-to-action.
 */
export default function Home() {
  // Memoize testimonials data to prevent unnecessary re-renders
  const testimonials = useMemo(() => [
    {
      id: 1,
      name: "Sarah Chen",
      role: "Tokyo Explorer",
      content: "Amazing! The AI created the perfect 5-day Tokyo itinerary. Every recommendation was spot-on!",
      avatar: "S",
      gradient: "from-orange-400 to-pink-500"
    },
    {
      id: 2,
      name: "Mike Rodriguez",
      role: "Europe Backpacker",
      content: "Saved me hours of planning! The custom itinerary feature is incredibly detailed and helpful.",
      avatar: "M",
      gradient: "from-blue-400 to-purple-500"
    },
    {
      id: 3,
      name: "Emily Johnson",
      role: "Family Traveler",
      content: "Perfect for family trips! The AI considered our kids' ages and created age-appropriate activities.",
      avatar: "E",
      gradient: "from-green-400 to-teal-500"
    }
  ], []);

  // Memoize step data to prevent unnecessary re-renders
  const steps = useMemo(() => [
    {
      id: 1,
      icon: FaMapMarkedAlt,
      title: "Choose Destination",
      description: "Tell us where you want to explore",
      gradient: "from-blue-500 to-purple-600",
      badgeColor: "bg-blue-100 text-blue-600"
    },
    {
      id: 2,
      icon: FaCalendarAlt,
      title: "Set Your Dates",
      description: "Pick your travel dates and duration",
      gradient: "from-green-500 to-teal-600",
      badgeColor: "bg-green-100 text-green-600"
    },
    {
      id: 3,
      icon: FaUser,
      title: "Customize Preferences",
      description: "Choose budget, style, and interests",
      gradient: "from-indigo-500 to-purple-600",
      badgeColor: "bg-indigo-100 text-indigo-600"
    },
    {
      id: 4,
      icon: FaPlane,
      title: "Get Your Itinerary",
      description: "Get your personalized itinerary",
      gradient: "from-orange-500 to-pink-600",
      badgeColor: "bg-orange-100 text-orange-600"
    }
  ], []);

  return (
    <main className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Parallax Effect */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/backgrounds/home-bg.jpg"
            alt="Travel Destination"
            fill
            style={{ objectFit: 'cover' }}
            priority
            loading="eager"
            quality={85}
            className="scale-110 transition-transform duration-1000 ease-out"
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60"></div>
        </div>

        {/* Floating Elements - Reduced for performance */}
        <div className="absolute inset-0 z-5">
          <div className="absolute top-20 left-10 w-4 h-4 bg-white/20 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-5 h-5 bg-pink-400/30 rounded-full animate-pulse"></div>
        </div>

        {/* Hero Content */}
        <div className="container-custom relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Plan Your Dream Trip with
              <span className="bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">AI</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed">
              Personalized itineraries created just for you in seconds
            </p>
            <div>
              <Link href="#get-started">
                <button className="bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold text-lg px-10 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-transform duration-150">
                  Get Started
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Four simple steps to your perfect trip</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 group"
                >
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className={`bg-gradient-to-r ${step.gradient} w-12 h-12 rounded-full flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                      <IconComponent className="text-white text-lg" />
                    </div>
                  </div>
                  <div className="pt-6 text-center">
                    <div className={`${step.badgeColor} text-xs font-bold px-2 py-1 rounded-full inline-block mb-3`}>STEP {step.id}</div>
                    <h3 className="text-lg font-bold mb-2 text-gray-800">{step.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Choose Your Planning Style Section */}
      <section id="get-started" className="py-24 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Choose Your Planning Style</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Pick the approach that works best for you</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* Quick AI Itinerary Card */}
            <div className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl overflow-hidden border border-gray-100 transition-all duration-200 hover:scale-105">
              <div className="relative bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 h-48 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10 text-center">
                  <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform duration-300">
                    <span className="text-3xl">⚡️</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Quick AI Itinerary</h3>
                </div>
                {/* Floating elements - Reduced */}
                <div className="absolute top-4 right-4 w-3 h-3 bg-white/30 rounded-full animate-pulse"></div>
                <div className="absolute bottom-6 left-6 w-2 h-2 bg-white/40 rounded-full animate-pulse"></div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-6 text-center leading-relaxed">One click, your trip is ready. Let our AI create the perfect itinerary based on your destination and dates.</p>
                <Link href="/quick-itinerary" className="block">
                  <button className="bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-3 px-6 rounded-full w-full hover:shadow-md transform hover:scale-105 transition-transform duration-150">
                    Get Started
                  </button>
                </Link>
              </div>
            </div>

            {/* Custom Planning Card */}
            <div className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl overflow-hidden border border-gray-100 transition-all duration-200 hover:scale-105">
              <div className="relative bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 h-48 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10 text-center">
                  <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform duration-300">
                    <span className="text-3xl">🛠</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Custom Planning</h3>
                </div>
                {/* Floating elements - Reduced */}
                <div className="absolute top-6 left-4 w-3 h-3 bg-white/30 rounded-full animate-pulse"></div>
                <div className="absolute bottom-4 right-6 w-2 h-2 bg-white/40 rounded-full animate-pulse"></div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-6 text-center leading-relaxed">Build your trip, your way. Customize every single detail of your itinerary with our powerful interactive planner.</p>
                <Link href="/custom-planning" className="block">
                  <button className="bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-3 px-6 rounded-full w-full hover:shadow-md transform hover:scale-105 transition-transform duration-150">
                    Get Started
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Background Pattern - Reduced */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-400 rounded-full blur-3xl"></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">What Our Travelers Say</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Real experiences from real travelers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Testimonial 1 */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-white/50 hover:scale-105">
              {/* Star Rating */}
              <div className="flex justify-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-xl">★</span>
                ))}
              </div>

              <p className="text-gray-700 text-lg leading-relaxed mb-6 italic">
                "The AI itinerary planner saved me hours of research. My trip to Japan was perfectly organized with a great mix of popular spots and hidden gems."
              </p>

              <div className="flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 shadow-lg">
                  JD
                </div>
                <div className="text-center">
                  <h4 className="font-bold text-gray-800 text-lg">John Doe</h4>
                  <p className="text-sm text-gray-600">New York, USA</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 border border-white/50 hover:scale-105">
              {/* Star Rating */}
              <div className="flex justify-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-xl">★</span>
                ))}
              </div>

              <p className="text-gray-700 text-lg leading-relaxed mb-6 italic">
                "I loved how easy it was to customize my itinerary. The suggestions were spot on and I discovered places I wouldn't have found otherwise."
              </p>

              <div className="flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 shadow-lg">
                  JS
                </div>
                <div className="text-center">
                  <h4 className="font-bold text-gray-800 text-lg">Jane Smith</h4>
                  <p className="text-sm text-gray-600">London, UK</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 border border-white/50 hover:scale-105">
              {/* Star Rating */}
              <div className="flex justify-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-xl">★</span>
                ))}
              </div>

              <p className="text-gray-700 text-lg leading-relaxed mb-6 italic">
                "As a frequent traveler, I've tried many planning tools, but this AI planner is by far the most intuitive and accurate. Highly recommended!"
              </p>

              <div className="flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 shadow-lg">
                  RJ
                </div>
                <div className="text-center">
                  <h4 className="font-bold text-gray-800 text-lg">Robert Johnson</h4>
                  <p className="text-sm text-gray-600">Sydney, Australia</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-orange-500 via-pink-500 to-pink-600 text-white relative overflow-hidden">
        {/* Floating Travel Icons - Reduced for performance */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 text-6xl animate-pulse">✈️</div>
          <div className="absolute bottom-20 right-20 text-4xl animate-pulse">🗺️</div>
          <div className="absolute top-1/2 left-1/2 text-3xl animate-pulse">🎒</div>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-purple-900/50"></div>

        <div className="container-custom text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Ready to Plan Your Next Adventure?
            </h2>
            <p className="text-xl md:text-2xl mb-12 opacity-90 max-w-3xl mx-auto leading-relaxed">
              Join thousands of travelers who trust our AI to create unforgettable journeys
            </p>

            <div>
              <Link
                href="/get-started"
                className="inline-flex items-center justify-center bg-gradient-to-r from-orange-600 to-pink-700 hover:from-orange-700 hover:to-pink-800 text-white font-bold text-xl px-12 py-6 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-transform duration-150 group border-2 border-white/20"
              >
                <span className="mr-3">Start Planning Now</span>
                <span className="text-2xl group-hover:translate-x-1 transition-transform duration-150">🚀</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
