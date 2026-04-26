'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiArrowLeft, FiShare2, FiHeart, FiMessageSquare } from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';

// Sample blog data - in a real app, this would come from an API or database
interface BlogPost {
  id: number;
  title: string;
  excerpt?: string;
  content: string;
  category: string;
  date: string;
  readTime: string;
  author: {
    name: string;
    role?: string;
    bio?: string;
    image: string;
  };
  image: string;
  relatedPosts: number[];
}

const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: '10 Hidden Gems in Southeast Asia You Need to Visit',
    content: `
      <p>Southeast Asia has long been a favorite destination for travelers seeking exotic experiences, stunning landscapes, and rich cultural heritage. While places like Bangkok, Bali, and Angkor Wat attract millions of visitors each year, the region is home to countless hidden gems that offer equally amazing experiences without the crowds.</p>
      
      <h2>1. Kampot, Cambodia</h2>
      <p>This sleepy riverside town is known for its colonial architecture, pepper plantations, and the nearby Bokor National Park. Take a sunset cruise on the Kampot River, explore abandoned French hill stations, or simply enjoy the laid-back atmosphere at one of the many riverside cafes.</p>
      
      <h2>2. Pai, Thailand</h2>
      <p>Nestled in the mountains of northern Thailand, Pai is a bohemian paradise with hot springs, waterfalls, and stunning canyon views. The small town has a vibrant night market and a relaxed atmosphere that makes it hard to leave.</p>
      
      <h2>3. Mrauk U, Myanmar</h2>
      <p>Often overshadowed by the more famous Bagan, Mrauk U features hundreds of ancient temples and pagodas scattered across rolling hills. The remote location means you'll likely have these archaeological wonders almost entirely to yourself.</p>
      
      <h2>4. Phong Nha-Ke Bang National Park, Vietnam</h2>
      <p>Home to some of the world's largest and most spectacular caves, including Hang Son Doong (the world's largest cave), this UNESCO World Heritage site offers unforgettable adventures for nature lovers and thrill-seekers alike.</p>
      
      <h2>5. Siquijor Island, Philippines</h2>
      <p>Known locally for mysticism and healing traditions, this small island boasts pristine beaches, enchanting waterfalls, and excellent diving opportunities without the crowds of more popular Philippine destinations.</p>
      
      <h2>6. Hsipaw, Myanmar</h2>
      <p>This small town in the Shan State offers authentic cultural experiences and spectacular trekking opportunities through traditional villages and lush landscapes. The train journey to Hsipaw from Mandalay is an adventure in itself.</p>
      
      <h2>7. Koh Rong Samloem, Cambodia</h2>
      <p>While neighboring Koh Rong has become increasingly developed, Koh Rong Samloem remains a peaceful paradise with powdery white beaches, crystal-clear waters, and minimal development. It's the perfect place to disconnect and unwind.</p>
      
      <h2>8. Bukittinggi, Indonesia</h2>
      <p>Located in the highlands of West Sumatra, this charming town offers cool mountain air, stunning gorges, and access to the unique Minangkabau culture. Don't miss the traditional houses with their distinctive curved roofs that resemble buffalo horns.</p>
      
      <h2>9. Luang Namtha, Laos</h2>
      <p>This northern Laos province is perfect for eco-tourism and trekking through pristine rainforests. The area is home to diverse ethnic minorities, and community-based tourism initiatives allow visitors to experience traditional ways of life while supporting local communities.</p>
      
      <h2>10. Con Dao Islands, Vietnam</h2>
      <p>Once a brutal prison island during French colonial rule, Con Dao has transformed into a serene destination with untouched beaches, diverse marine life, and lush national parks. The islands' remoteness has preserved both their natural beauty and historical significance.</p>
      
      <p>When planning your Southeast Asia adventure, consider venturing beyond the well-trodden tourist path to discover these hidden gems. Not only will you avoid the crowds, but you'll also experience a more authentic side of this fascinating region while supporting communities that benefit from sustainable tourism.</p>
    `,
    category: 'Destinations',
    date: 'June 15, 2023',
    readTime: '8 min read',
    author: {
      name: 'Emma Rodriguez',
      bio: 'Travel writer and photographer with a passion for off-the-beaten-path destinations.',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80'
    },
    image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    relatedPosts: [2, 3, 5]
  },
  {
    id: 2,
    title: 'How AI is Revolutionizing the Travel Industry',
    content: `<p>The travel industry is undergoing a significant transformation thanks to artificial intelligence. From planning to booking to the actual travel experience, AI is changing how we explore the world.</p>`,
    category: 'Technology',
    date: 'May 28, 2023',
    readTime: '6 min read',
    author: {
      name: 'Michael Chen',
      bio: 'Tech enthusiast and travel blogger focusing on the intersection of technology and tourism.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80'
    },
    image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    relatedPosts: [1, 4, 6]
  },
  {
    id: 3,
    title: 'Budget Travel Guide: Europe on Less Than $50 a Day',
    content: `<p>Traveling through Europe doesn't have to break the bank. With careful planning and these insider tips, you can experience the best of European culture, history, and cuisine on a budget.</p>`,
    category: 'Budget Travel',
    date: 'April 10, 2023',
    readTime: '10 min read',
    author: {
      name: 'Alex Johnson',
      bio: 'Budget travel expert who has visited over 50 countries while maintaining a full-time job.',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80'
    },
    image: 'https://images.unsplash.com/photo-1491557345352-5929e343eb89?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    relatedPosts: [1, 4, 5]
  },
  {
    id: 4,
    title: 'The Ultimate Packing Checklist for Any Trip',
    content: `<p>Packing efficiently can make or break your travel experience. This comprehensive guide covers everything you need for any type of trip, from weekend getaways to long-term international travel.</p>`,
    category: 'Travel Tips',
    date: 'March 22, 2023',
    readTime: '5 min read',
    author: {
      name: 'Sarah Williams',
      bio: 'Organization expert and frequent traveler who has perfected the art of packing light.',
      image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80'
    },
    image: 'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    relatedPosts: [2, 3, 6]
  },
  {
    id: 5,
    title: 'Sustainable Tourism: How to Reduce Your Carbon Footprint While Traveling',
    content: `<p>As awareness of climate change grows, many travelers are looking for ways to explore the world more responsibly. This guide provides practical tips for minimizing your environmental impact without sacrificing meaningful travel experiences.</p>`,
    category: 'Sustainable Travel',
    date: 'February 14, 2023',
    readTime: '7 min read',
    author: {
      name: 'David Miller',
      bio: 'Environmental scientist and travel writer focused on sustainable tourism practices.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80'
    },
    image: 'https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    relatedPosts: [1, 3, 6]
  },
  {
    id: 6,
    title: 'Family-Friendly Destinations That Both Kids and Adults Will Love',
    content: `<p>Planning a family vacation that keeps everyone happy can be challenging. These destinations offer the perfect balance of activities for children and relaxation opportunities for parents.</p>`,
    category: 'Family Travel',
    date: 'January 30, 2023',
    readTime: '9 min read',
    author: {
      name: 'Jennifer Lopez',
      bio: 'Family travel specialist and mother of three who has traveled to over 30 countries with her children.',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80'
    },
    image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    relatedPosts: [2, 4, 5]
  }
];

export default function BlogPost() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would be an API call
    const fetchPost = () => {
      setLoading(true);
      const id = Number(params.id);
      const foundPost = blogPosts.find(post => post.id === id);

      if (foundPost) {
        setPost(foundPost);

        // Get related posts
        if (foundPost.relatedPosts && foundPost.relatedPosts.length > 0) {
          const related = blogPosts.filter(p => foundPost.relatedPosts.includes(p.id));
          setRelatedPosts(related);
        }
      }

      setLoading(false);
    };

    fetchPost();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen py-20 bg-light-bg">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-primary mb-6">Blog Post Not Found</h1>
          <p className="text-lg text-gray-600 mb-8">The blog post you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link href="/blogs" className="btn-primary">
            Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen py-20 bg-light-bg">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center text-primary hover:text-accent transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Back to Blogs
          </button>
        </motion.div>

        {/* Blog Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative h-96">
              <Image
                src={post.image}
                alt={post.title}
                fill
                sizes="100vw"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-8 text-white">
                  <div className="mb-4">
                    <span className="bg-accent text-white text-sm font-bold px-3 py-1 rounded-full">
                      {post.category}
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
                  <div className="flex flex-wrap items-center text-sm text-white/80">
                    <div className="flex items-center mr-6 mb-2">
                      <Image
                        src={post.author.image}
                        alt={post.author.name}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full mr-2 object-cover"
                      />
                      <span>{post.author.name}</span>
                    </div>
                    <div className="flex items-center mr-6 mb-2">
                      <FiCalendar className="mr-2" />
                      <span>{post.date}</span>
                    </div>
                    <div className="flex items-center mb-2">
                      <FiClock className="mr-2" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Blog Content and Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-lg shadow-md p-8">
              {/* Social Sharing */}
              <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-200">
                <div className="flex items-center">
                  <Image
                    src={post.author.image}
                    alt={post.author.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <p className="font-medium text-primary">{post.author.name}</p>
                    <p className="text-sm text-gray-500">{post.author.bio}</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                    <FiShare2 className="text-gray-600" />
                  </button>
                  <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                    <FiHeart className="text-gray-600" />
                  </button>
                  <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                    <FiMessageSquare className="text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Article Content */}
              <article className="prose prose-lg max-w-none">
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              </article>

              {/* Tags */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-primary mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {['Travel', 'Southeast Asia', 'Hidden Gems', 'Adventure', 'Cultural Experience'].map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-8"
          >
            {/* Author Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">About the Author</h3>
              <div className="flex items-center mb-4">
                <Image
                  src={post.author.image}
                  alt={post.author.name}
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-full mr-4 object-cover"
                />
                <div>
                  <p className="font-medium text-primary">{post.author.name}</p>
                  <p className="text-sm text-gray-500">Travel Writer</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">{post.author.bio}</p>
              <button className="text-primary font-medium hover:text-accent transition-colors">
                View All Posts
              </button>
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">Related Posts</h3>
                <div className="space-y-4">
                  {relatedPosts.map((relatedPost) => (
                    <Link
                      key={relatedPost.id}
                      href={`/blogs/${relatedPost.id}`}
                      className="block group"
                    >
                      <div className="flex items-start">
                        <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0 mr-4">
                          <Image
                            src={relatedPost.image}
                            alt={relatedPost.title}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div>
                          <h4 className="font-medium text-primary group-hover:text-accent transition-colors">
                            {relatedPost.title}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">{relatedPost.date}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">Categories</h3>
              <ul className="space-y-2">
                {['Destinations', 'Travel Tips', 'Budget Travel', 'Sustainable Travel', 'Technology', 'Family Travel'].map((category, index) => (
                  <li key={index}>
                    <Link
                      href={`/blogs?category=${category}`}
                      className="flex items-center justify-between text-gray-600 hover:text-primary transition-colors"
                    >
                      <span>{category}</span>
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                        {index + 2}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Newsletter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 bg-primary text-white rounded-lg p-8"
        >
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Enjoy this article?</h2>
            <p className="text-white/80 mb-6">Subscribe to our newsletter for more travel tips, destination guides, and exclusive content.</p>

            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
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
          </div>
        </motion.div>
      </div>
    </main>
  );
}
