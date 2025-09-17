import { Metadata } from 'next';
import Navbar from "@/components/Layout/Navbar";
import Gallery from "@/components/sections/gallery/Gallery";
import Footer from "@/components/sections/home/Footer";

export const metadata = {
  title: 'Gallery - River Tiger Resort Photos | Beautiful Views of Chakrata & Tiger Fall',
  description: 'Explore stunning photos of River Tiger Resort & Camping Adventure near Tiger Fall, Chakrata. View our beautiful accommodations, breathtaking mountain views, adventure activities, lush surroundings, and memorable guest experiences in Dehradun, Uttarakhand.',
  icons: {
    icon: '/Home/icon.jpeg',
  },
  keywords: [
    'River Tiger Resort photos',
    'Chakrata resort images',
    'Tiger Fall pictures',
    'Dehradun resort gallery',
    'mountain resort photos',
    'adventure resort images',
    'Uttarakhand tourism photos',
    'camping photos Chakrata',
    'nature photography',
    'hill station images',
    'resort accommodation photos',
    'scenic views Chakrata',
    'Tiger Fall waterfall photos',
    'adventure activities images',
    'mountain landscape photography'
  ],
  authors: [{ name: 'River Tiger Resort Photography Team' }],
  creator: 'River Tiger Resort & Camping Adventure',
  publisher: 'River Tiger Resort',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://rivertigerresort.com/gallery',
    siteName: 'River Tiger Resort & Camping Adventure',
    title: 'Photo Gallery - River Tiger Resort | Stunning Chakrata & Tiger Fall Views',
    description: 'Browse through our comprehensive photo gallery showcasing the natural beauty of River Tiger Resort, spectacular Tiger Fall views, comfortable accommodations, and exciting adventure activities in Chakrata.',
    images: [
      {
        url: '/images/gallery-hero.jpg', // Replace with actual gallery hero image
        width: 1200,
        height: 630,
        alt: 'River Tiger Resort photo gallery - stunning mountain views and luxury accommodations',
      },
      {
        url: '/images/tiger-fall-view.jpg', // Replace with actual Tiger Fall image
        width: 800,
        height: 600,
        alt: 'Beautiful Tiger Fall waterfall near River Tiger Resort',
      },
      {
        url: '/images/resort-rooms.jpg', // Replace with actual room images
        width: 800,
        height: 600,
        alt: 'Comfortable and well-appointed rooms at River Tiger Resort',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@rivertigerresort', // Replace with actual Twitter handle
    creator: '@rivertigerresort',
    title: 'Photo Gallery - River Tiger Resort | Chakrata Mountain Views',
    description: 'Discover the breathtaking beauty of River Tiger Resort through our photo gallery. See stunning Tiger Fall views, comfortable accommodations, and adventure activities.',
    images: ['/images/gallery-hero.jpg'], // Replace with actual image path
  },
  alternates: {
    canonical: 'https://rivertigerresort.com/gallery',
  },
  category: 'travel',
  classification: 'Resort Photo Gallery and Visual Content',
  other: {
    'og:image:width': '1200',
    'og:image:height': '630',
    'geo.region': 'IN-UT',
    'geo.placename': 'Chakrata, Dehradun, Uttarakhand',
  },
};

// JSON-LD structured data for Gallery page
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ImageGallery',
  name: 'River Tiger Resort Photo Gallery',
  description: 'A comprehensive photo gallery showcasing the beauty of River Tiger Resort, Tiger Fall, and the surrounding Chakrata mountains',
  url: 'https://rivertigerresort.com/gallery',
  mainEntity: {
    '@type': 'Resort',
    name: 'River Tiger Resort & Camping Adventure',
    image: [
      'https://rivertigerresort.com/images/gallery-hero.jpg', // Replace with actual URLs
      'https://rivertigerresort.com/images/tiger-fall-view.jpg',
      'https://rivertigerresort.com/images/resort-rooms.jpg',
      'https://rivertigerresort.com/images/adventure-activities.jpg',
      'https://rivertigerresort.com/images/dining-area.jpg',
      'https://rivertigerresort.com/images/mountain-views.jpg',
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Near Tiger Fall',
      addressLocality: 'Chakrata',
      addressRegion: 'Uttarakhand',
      postalCode: '248123', // Add actual postal code
      addressCountry: 'IN',
    },
  },
  about: [
    {
      '@type': 'Thing',
      name: 'Tiger Fall',
      description: 'Beautiful waterfall near the resort',
    },
    {
      '@type': 'Thing',
      name: 'Chakrata Mountains',
      description: 'Scenic mountain landscapes',
    },
    {
      '@type': 'Thing',
      name: 'Adventure Activities',
      description: 'Various outdoor adventure activities',
    },
    {
      '@type': 'Thing',
      name: 'Resort Accommodations',
      description: 'Comfortable rooms and facilities',
    },
  ],
  keywords: [
    'resort photography',
    'Tiger Fall photos',
    'Chakrata scenery',
    'mountain views',
    'adventure activities',
    'luxury accommodation'
  ],
  contentLocation: {
    '@type': 'Place',
    name: 'Chakrata, Dehradun, Uttarakhand, India',
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 30.7046, // Replace with actual coordinates
      longitude: 77.8672,
    },
  },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://rivertigerresort.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Gallery',
        item: 'https://rivertigerresort.com/gallery',
      },
    ],
  },
  publisher: {
    '@type': 'Organization',
    name: 'River Tiger Resort & Camping Adventure',
    logo: {
      '@type': 'ImageObject',
      url: 'https://rivertigerresort.com/images/logo.jpg', // Replace with actual logo
    },
  },
};

export default function Page() {
  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="font-sans">
        <Navbar />
        <Gallery />
        <Footer />
      </div>
    </>
  );
}
