import { Metadata } from 'next';
import Navbar from "@/components/Layout/Navbar";
import AboutUs from "@/components/sections/aboutus/AboutUs";
import Adventure from "@/components/sections/adventure/Adventure";
import Booking from "@/components/sections/booking/Booking";
import Footer from "@/components/sections/home/Footer";

export const metadata = {
  title: 'About Us - River Tiger Resort & Camping Adventure | Our Story & Mission',
  description: 'Learn about River Tiger Resort & Camping Adventure, a premier 3-star resort near Tiger Fall, Chakrata. Discover our commitment to providing exceptional hospitality, adventure experiences, and sustainable tourism in the beautiful hills of Dehradun, Uttarakhand.',
  icons: {
    icon: '/Home/icon.jpeg',
  },
  keywords: [
    'About River Tiger Resort',
    'resort history Chakrata',
    'Tiger Fall resort story',
    'Dehradun hospitality',
    'sustainable tourism Uttarakhand',
    'adventure resort mission',
    'Chakrata accommodation story',
    'mountain resort values',
    'eco-friendly resort',
    'family resort Dehradun',
    'resort team Chakrata',
    'hospitality excellence',
    'nature conservation resort',
    'adventure tourism pioneers',
    'Uttarakhand resort heritage'
  ],
  authors: [{ name: 'River Tiger Resort Management' }],
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
    url: 'https://rivertigerresort.com/about-us',
    siteName: 'River Tiger Resort & Camping Adventure',
    title: 'About River Tiger Resort - Our Journey & Values | Chakrata, Dehradun',
    description: 'Discover the story behind River Tiger Resort & Camping Adventure. Learn about our passion for hospitality, commitment to sustainable tourism, and dedication to creating unforgettable mountain experiences near Tiger Fall.',
    images: [
      {
        url: '/images/about-us-team.jpg', // Replace with actual team/resort image
        width: 1200,
        height: 630,
        alt: 'River Tiger Resort team and management - committed to exceptional hospitality',
      },
      {
        url: '/images/resort-heritage.jpg', // Replace with actual heritage/story image
        width: 800,
        height: 600,
        alt: 'River Tiger Resort story and heritage in Chakrata mountains',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@rivertigerresort', // Replace with actual Twitter handle
    creator: '@rivertigerresort',
    title: 'About River Tiger Resort - Our Story & Mission | Chakrata',
    description: 'Learn about our journey, values, and commitment to providing exceptional adventure and hospitality experiences in the serene mountains of Chakrata, Dehradun.',
    images: ['/images/about-us-team.jpg'], // Replace with actual image path
  },
  alternates: {
    canonical: 'https://rivertigerresort.com/about-us',
  },
  category: 'travel',
  classification: 'Resort Information and Company Profile',
  other: {
    'article:author': 'River Tiger Resort Management',
    'article:publisher': 'River Tiger Resort & Camping Adventure',
    'geo.region': 'IN-UT',
    'geo.placename': 'Chakrata, Dehradun, Uttarakhand',
  },
};

// JSON-LD structured data for About Us page
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  mainEntity: {
    '@type': 'Resort',
    name: 'River Tiger Resort & Camping Adventure',
    description: 'A family-owned 3-star resort dedicated to providing exceptional hospitality and adventure experiences in the pristine mountains of Chakrata, near Tiger Fall',
    foundingDate: '2010', // Replace with actual founding date
    url: 'https://rivertigerresort.com',
    logo: 'https://rivertigerresort.com/images/logo.jpg', // Replace with actual logo URL
    image: 'https://rivertigerresort.com/images/about-us-main.jpg', // Replace with actual image
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Near Tiger Fall',
      addressLocality: 'Chakrata',
      addressRegion: 'Uttarakhand',
      postalCode: '248123', // Add actual postal code
      addressCountry: 'IN',
    },
    founder: {
      '@type': 'Person',
      name: 'Founder Name', // Replace with actual founder name
    },
    mission: 'To provide exceptional hospitality while preserving the natural beauty of Chakrata and promoting sustainable tourism in Uttarakhand',
    values: [
      'Sustainable Tourism',
      'Environmental Conservation',
      'Guest Satisfaction',
      'Community Engagement',
      'Adventure & Safety'
    ],
    numberOfEmployees: '25-50', // Replace with actual range
    areaServed: {
      '@type': 'Place',
      name: 'Chakrata, Dehradun, Uttarakhand, India',
    },
    knowsAbout: [
      'Adventure Tourism',
      'Mountain Hospitality',
      'Eco-friendly Practices',
      'Local Culture',
      'Nature Conservation'
    ],
    sameAs: [
      'https://www.facebook.com/rivertigerresort', // Add actual social media URLs
      'https://www.instagram.com/rivertigerresort',
      'https://www.linkedin.com/company/rivertigerresort',
    ],
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
        name: 'About Us',
        item: 'https://rivertigerresort.com/about-us',
      },
    ],
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
        <AboutUs />
        <Footer />
      </div>
    </>
  );
}
