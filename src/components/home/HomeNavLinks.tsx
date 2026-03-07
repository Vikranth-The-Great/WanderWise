'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

/**
 * Navigation links component for the home page header.
 * Conditionally renders links based on the current pathname.
 */
export default function HomeNavLinks() {
  const pathname = usePathname();

  // Only show nav links on specific pages: Home, blogs, about, contact
  const allowedPages = ['/', '/blogs', '/about', '/contact'];
  if (!allowedPages.includes(pathname)) {
    return null;
  }

  return (
    <div className="hidden md:flex items-center space-x-8">
      <Link href="/" className="text-white hover:text-accent transition-colors">
        Home
      </Link>
      <Link href="/blogs" className="text-white hover:text-accent transition-colors">
        Blogs
      </Link>
      <Link href="/contact" className="text-white hover:text-accent transition-colors">
        Contact
      </Link>
      <Link href="/about" className="text-white hover:text-accent transition-colors">
        About
      </Link>
    </div>
  );
}