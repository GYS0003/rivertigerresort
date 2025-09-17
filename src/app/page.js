import { Metadata } from 'next';
import Navbar from "@/components/Layout/Navbar";
import Home from "@/components/sections/home/Home";

export const metadata = {
  title: 'River Tiger Resort & Camping Adventure | Resort in Chakrata, Dehradun',
  description: 'Experience the ultimate getaway at River Tiger Resort & Camping Adventure near Tiger Fall, Chakrata. Enjoy beautiful mountain views, peaceful surroundings, adventure activities, and comfortable accommodation in Dehradun, Uttarakhand.',
  icons:{
    icon: '/Home/icon.jpeg',
  },
  keywords: [
    'River Tiger Resort',
    'Chakrata resort',
    'Dehradun hotels',
    'Tiger Fall resort',
    'camping adventure',
    'Uttarakhand tourism',
    'mountain resort',
    'weekend getaway',
    'adventure resort',
    'nature resort',
    'hill station resort',
    'Chakrata accommodation',
    'Dehradun resort booking',
    'Tiger Fall camping',
    'adventure tourism Uttarakhand'
  ],
  authors: [{ name: 'River Tiger Resort' }],
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
    url: 'https://rivertigerresort.com',
    siteName: 'River Tiger Resort & Camping Adventure',
    title: 'River Tiger Resort & Camping Adventure | Premier Resort in Chakrata',
    description: 'Discover adventure and tranquility at River Tiger Resort near Tiger Fall, Chakrata. Book your perfect mountain getaway with stunning views, camping, and adventure activities in Dehradun.',
    images: [
      {
        url: '/images/resort-main.jpg', // Replace with actual image path
        width: 1200,
        height: 630,
        alt: 'River Tiger Resort & Camping Adventure - Beautiful mountain resort near Tiger Fall',
      },
      {
        url: '/images/resort-logo.jpg', // Replace with actual logo path
        width: 800,
        height: 600,
        alt: 'River Tiger Resort Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@rivertigerresort', // Replace with actual Twitter handle
    creator: '@rivertigerresort',
    title: 'River Tiger Resort & Camping Adventure | Chakrata, Dehradun',
    description: 'Experience adventure and serenity at River Tiger Resort near Tiger Fall. Perfect destination for camping, adventure activities, and peaceful mountain retreats.',
    images: ['/images/resort-main.jpg'], // Replace with actual image path
  },
  verification: {
    google: 'your-google-verification-code', // Add your Google verification code
    yandex: 'your-yandex-verification-code', // Add if needed
    yahoo: 'your-yahoo-verification-code', // Add if needed
  },
  category: 'travel',
  classification: 'Resort and Adventure Tourism',
  other: {
    'geo.region': 'IN-UT',
    'geo.placename': 'Chakrata, Dehradun, Uttarakhand',
    'geo.position': '30.7046;77.8672', // Replace with actual coordinates
    'ICBM': '30.7046, 77.8672', // Replace with actual coordinates
  },
};

// JSON-LD structured data for better SEO
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Resort',
  name: 'River Tiger Resort & Camping Adventure',
  description: 'A 3-star resort offering adventure and camping experiences near Tiger Fall in Chakrata, Dehradun',
  image: 'https://rivertigerresort.com/images/resort-main.jpg', // Replace with actual URL
  url: 'https://rivertigerresort.com',
  telephone: '+91-9389 303576', // Add actual phone number
  email: 'info@rivertigerresort.com', // Add actual email
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Near Tiger Fall',
    addressLocality: 'Chakrata',
    addressRegion: 'Uttarakhand',
    postalCode: '248123', // Add actual postal code
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 30.7046, // Replace with actual coordinates
    longitude: 77.8672,
  },
  starRating: {
    '@type': 'Rating',
    ratingValue: '3',
    bestRating: '5',
  },
  amenityFeature: [
    { '@type': 'LocationFeatureSpecification', name: 'Adventure Activities' },
    { '@type': 'LocationFeatureSpecification', name: 'Camping' },
    { '@type': 'LocationFeatureSpecification', name: 'Mountain Views' },
    { '@type': 'LocationFeatureSpecification', name: 'Peaceful Location' },
    { '@type': 'LocationFeatureSpecification', name: 'Restaurant' },
    { '@type': 'LocationFeatureSpecification', name: 'Parking' },
  ],
  priceRange: '₹₹', // Adjust based on actual pricing
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.2', // Replace with actual rating
    reviewCount: '150', // Replace with actual review count
  },
  sameAs: [
    'https://www.facebook.com/rivertigerresort', // Add actual social media URLs
    'https://www.instagram.com/rivertigerresort',
    'https://www.tripadvisor.com/rivertigerresort',
  ],
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
        <Home />
      </div>
    </>
  );
}
