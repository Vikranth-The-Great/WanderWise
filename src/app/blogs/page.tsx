'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiSearch } from 'react-icons/fi';
import Link from 'next/link';

/**
 * Blogs page component.
 * Lists travel articles with search and category filtering capabilities.
 */
export default function Blogs() {
  const [searchQuery, setSearchQuery] = useState('');

  // Sample blog data
  const blogPosts = [
    {
      id: 1,
      title: '10 Hidden Gems in Southeast Asia You Need to Visit',
      excerpt: 'Discover lesser-known destinations in Southeast Asia that offer authentic experiences away from the tourist crowds.',
      category: 'Destinations',
      date: 'June 15, 2023',
      readTime: '8 min read',
      image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    },
    {
      id: 2,
      title: 'How AI is Revolutionizing the Travel Industry',
      excerpt: 'From personalized itineraries to smart recommendations, artificial intelligence is changing how we plan and experience travel.',
      category: 'Technology',
      date: 'May 28, 2023',
      readTime: '6 min read',
      image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    },
    {
      id: 3,
      title: 'Budget Travel Guide: Europe on Less Than $50 a Day',
      excerpt: 'Learn how to experience the best of Europe without breaking the bank with these practical tips and strategies.',
      category: 'Budget Travel',
      date: 'April 10, 2023',
      readTime: '10 min read',
      image: 'https://images.unsplash.com/photo-1491557345352-5929e343eb89?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    },
    {
      id: 4,
      title: 'The Ultimate Packing Checklist for Any Trip',
      excerpt: 'Never forget essential items again with our comprehensive packing guide that works for any destination or season.',
      category: 'Travel Tips',
      date: 'March 22, 2023',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    },
    {
      id: 5,
      title: 'Sustainable Tourism: How to Reduce Your Carbon Footprint While Traveling',
      excerpt: 'Practical ways to make your travels more environmentally friendly without sacrificing experiences.',
      category: 'Sustainable Travel',
      date: 'February 14, 2023',
      readTime: '7 min read',
      image: 'https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    },
    {
      id: 6,
      title: 'Family-Friendly Destinations That Both Kids and Adults Will Love',
      excerpt: 'Discover places around the world that offer the perfect balance of activities for children and relaxation for parents.',
      category: 'Family Travel',
      date: 'January 30, 2023',
      readTime: '9 min read',
      image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    }
  ];

  // Filter blogs based on search query
  const filteredBlogs = blogPosts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Categories for filter buttons
  const categories = ['All', 'Destinations', 'Technology', 'Budget Travel', 'Travel Tips', 'Sustainable Travel', 'Family Travel'];
  const [activeCategory, setActiveCategory] = useState('All');

  // Filter blogs based on category
  const categoryFilteredBlogs = activeCategory === 'All'
    ? filteredBlogs
    : filteredBlogs.filter(post => post.category === activeCategory);

  return (
    <main className="min-h-screen py-20 bg-light-bg">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">Travel Blog</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover travel tips, destination guides, and insights to enhance your journey planning experience.
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Search Bar */}
            <div className="relative w-full md:w-96">
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category, index) => (
                <button
                  key={index}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === category ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Blog Posts Grid */}
        {categoryFilteredBlogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categoryFilteredBlogs.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">
                      {post.category}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <FiCalendar className="mr-2" />
                    <span className="mr-4">{post.date}</span>
                    <FiClock className="mr-2" />
                    <span>{post.readTime}</span>
                  </div>

                  <h2 className="text-xl font-bold text-primary mb-3 hover:text-accent transition-colors">
                    <Link href={`/blogs/${post.id}`}>
                      {post.title}
                    </Link>
                  </h2>

                  <p className="text-gray-600 mb-4">{post.excerpt}</p>

                  <Link
                    href={`/blogs/${post.id}`}
                    className="text-primary font-medium hover:text-accent transition-colors inline-flex items-center"
                  >
                    Read More
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16"
          >
            <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-primary mb-2">No Results Found</h3>
              <p className="text-gray-600 mb-4">We couldn't find any blog posts matching your search criteria.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('All');
                }}
                className="btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          </motion.div>
        )}

        {/* Newsletter Signup */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-20 bg-primary text-white rounded-lg p-8 md:p-12"
        >
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
            <p className="text-white/80 mb-8">Get the latest travel tips, destination guides, and exclusive offers delivered straight to your inbox.</p>

            <form className="flex flex-col md:flex-row gap-4">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-grow px-4 py-3 rounded-lg focus:outline-none text-gray-800"
                required
              />
              <button
                type="submit"
                className="bg-accent hover:bg-accent/90 text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Subscribe
              </button>
            </form>

            <p className="text-white/60 text-sm mt-4">We respect your privacy. Unsubscribe at any time.</p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}