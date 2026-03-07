'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, MapPin, Clock, DollarSign, ExternalLink, ChevronDown, ChevronUp, Calendar, Timer, Sparkles, Star } from 'lucide-react';

interface AttractionDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  attraction: {
    id: string;
    title: string;
    description: string;
    location: string;
    duration: string;
    cost: string;
    image?: string;
    type?: string;
  };
}

interface ExpandableSection {
  id: string;
  title: string;
  icon: string;
  content: string;
}

/**
 * Modal component for displaying detailed attraction information.
 * Shows hero image, quick stats, expandable descriptions, and external links.
 */
const AttractionDetailPanel: React.FC<AttractionDetailPanelProps> = ({
  isOpen,
  onClose,
  attraction
}) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['description']);

  // Static data for demonstration - can be made dynamic later
  const attractionDetails = {
    subtitle: "Historical Monument",
    openingHours: "9:00 AM - 6:00 PM",
    entryFee: "$15 per person",
    googleMapsLink: "https://maps.google.com",
    bestSeason: "Spring & Fall",
    suggestedDuration: "2-3 hours",
    sections: [
      {
        id: 'description',
        title: 'Description & Backstory',
        icon: '📝',
        content: `${attraction.description}\n\nThis magnificent attraction has a rich history dating back centuries. Built during the golden age of architecture, it stands as a testament to the artistic and cultural achievements of its time. The intricate details and craftsmanship showcase the skills of master artisans who dedicated years to its construction.`
      },
      {
        id: 'highlights',
        title: 'Top Highlights & Unique Features',
        icon: '🌟',
        content: 'Stunning architectural details with intricate carvings\n• Panoramic views from the observation deck\n• Original artifacts and historical exhibits\n• Beautiful gardens and courtyards\n• Interactive multimedia displays\n• Guided tours available in multiple languages'
      },
      {
        id: 'events',
        title: 'Events & Experiences',
        icon: '🎉',
        content: 'Cultural festivals held monthly\n• Photography workshops every weekend\n• Historical reenactments during summer\n• Special night illumination tours\n• Educational programs for students\n• Seasonal art exhibitions'
      },
      {
        id: 'activities',
        title: 'Top Things To Do',
        icon: '📌',
        content: 'Explore the main exhibition halls\n• Climb to the observation tower\n• Visit the gift shop for unique souvenirs\n• Enjoy refreshments at the on-site café\n• Take photos at designated viewpoints\n• Join a guided historical tour'
      }
    ] as ExpandableSection[]
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [sectionId]
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button - Fixed at top right of modal */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-200 z-50 shadow-lg"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              {/* Scrollable Content */}
              <div className="overflow-y-auto max-h-[85vh]">
                {/* Hero Section with Full-Width Image */}
                <div className="relative">
                  <div className="aspect-[16/9] relative">
                    <Image
                      src={attraction.image || '/images/placeholder.svg'}
                      alt={attraction.title}
                      fill
                      className="object-cover"
                    />

                    {/* Dark Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                    {/* Overlay Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <div className="mb-4">
                        <h1 className="text-3xl font-bold mb-2 drop-shadow-lg">{attraction.title}</h1>
                        <p className="text-white/90 text-lg font-medium mb-1">{attractionDetails.subtitle}</p>
                        <div className="flex items-center gap-2 text-white/80">
                          <MapPin className="w-4 h-4" />
                          <span className="font-medium">{attraction.location}</span>
                        </div>
                      </div>

                      {/* Pill-style Tags */}
                      <div className="flex flex-wrap gap-3">
                        <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-semibold border border-white/30">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{attractionDetails.openingHours}</span>
                          </div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-semibold border border-white/30">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            <span>{attractionDetails.entryFee}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Info Section - Pill-shaped Cards */}
                <div className="p-8 bg-gradient-to-br from-gray-50 to-white">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-2xl shadow-sm border border-blue-200/50">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-sm font-medium text-blue-700">Opening Hours</div>
                      </div>
                      <div className="font-bold text-blue-900 text-lg">{attractionDetails.openingHours}</div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-2xl shadow-sm border border-green-200/50">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-sm font-medium text-green-700">Entry Fee</div>
                      </div>
                      <div className="font-bold text-green-900 text-lg">{attractionDetails.entryFee}</div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-2xl shadow-sm border border-purple-200/50">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-sm font-medium text-purple-700">Best Season</div>
                      </div>
                      <div className="font-bold text-purple-900 text-lg">{attractionDetails.bestSeason}</div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-2xl shadow-sm border border-orange-200/50">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                          <Timer className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-sm font-medium text-orange-700">Duration</div>
                      </div>
                      <div className="font-bold text-orange-900 text-lg">{attractionDetails.suggestedDuration}</div>
                    </div>
                  </div>
                </div>

                {/* Details Section - Enhanced Accordion */}
                <div className="p-8 space-y-6">
                  {attractionDetails.sections.map((section, index) => (
                    <div key={section.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full p-6 hover:bg-gray-50 transition-all duration-200 flex items-center justify-between text-left group"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg ${index === 0 ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                            index === 1 ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                              index === 2 ? 'bg-gradient-to-br from-green-500 to-green-600' :
                                'bg-gradient-to-br from-orange-500 to-orange-600'
                            }`}>
                            {index === 0 ? <Star className="w-6 h-6" /> :
                              index === 1 ? <Sparkles className="w-6 h-6" /> :
                                index === 2 ? <Calendar className="w-6 h-6" /> :
                                  <MapPin className="w-6 h-6" />}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{section.title}</span>
                            <div className="text-sm text-gray-500 mt-1">Click to {expandedSections.includes(section.id) ? 'collapse' : 'expand'}</div>
                          </div>
                        </div>
                        <div className={`transition-transform duration-200 ${expandedSections.includes(section.id) ? 'rotate-180' : ''
                          }`}>
                          <ChevronDown className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
                        </div>
                      </button>

                      <AnimatePresence>
                        {expandedSections.includes(section.id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-gray-100">
                              <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
                                <div className="text-gray-700 leading-relaxed whitespace-pre-line text-base">
                                  {section.content}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>

                {/* Quick Links Section - Enhanced */}
                <div className="p-8 bg-gradient-to-br from-gray-50 to-white border-t border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-6 text-xl">Explore More</h3>
                  <div className="flex justify-center gap-6">
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(attraction.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-red-500/25">
                        <span className="text-2xl font-bold">G</span>
                      </div>
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">Google</div>
                    </a>

                    <a
                      href={`https://www.instagram.com/explore/tags/${encodeURIComponent(attraction.title.replace(/\s+/g, ''))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-pink-500/25">
                        <span className="text-2xl">📷</span>
                      </div>
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">Instagram</div>
                    </a>

                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(attraction.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center text-white shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-red-600/25">
                        <span className="text-2xl">▶</span>
                      </div>
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">YouTube</div>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AttractionDetailPanel;