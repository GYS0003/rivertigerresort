import { Metadata } from 'next';
import Navbar from "@/components/Layout/Navbar";
import ContactUs from "@/components/sections/contactus/ContactUs";
import Footer from "@/components/sections/home/Footer";

export const metadata = {
  title: 'Contact Us - River Tiger Resort | Book Your Stay & Get Directions to Chakrata',
  description: 'Contact River Tiger Resort & Camping Adventure for bookings, inquiries, and directions. Located near Tiger Fall, Chakrata, Dehradun. Call us, email, or visit our resort in the beautiful mountains of Uttarakhand for your perfect getaway.',
  keywords: [
    'contact River Tiger Resort',
    'book Chakrata resort',
    'Tiger Fall resort contact',
    'Dehradun resort booking',
    'resort phone number',
    'Chakrata directions',
    'River Tiger Resort address',
    'resort inquiry',
    'mountain resort contact',
    'Uttarakhand resort booking',
    'adventure resort contact',
    'Tiger Fall accommodation contact',
    'Chakrata hotel contact',
    'resort email address',
    'booking enquiry Chakrata'
  ],
  authors: [{ name: 'River Tiger Resort Customer Service' }],
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
    url: 'https://rivertigerresort.com/contact',
    siteName: 'River Tiger Resort & Camping Adventure',
    title: 'Contact River Tiger Resort | Book Your Chakrata Mountain Getaway',
    description: 'Get in touch with River Tiger Resort for reservations, inquiries, and travel information. Located near beautiful Tiger Fall in Chakrata, Dehradun. Easy booking and personalized service for your mountain adventure.',
    images: [
      {
        url: '/images/contact-resort.jpg', // Replace with actual contact/location image
        width: 1200,
        height: 630,
        alt: 'River Tiger Resort location and contact - beautiful mountain setting near Tiger Fall',
      },
      {
        url: '/images/resort-map-location.jpg', // Replace with actual map/directions image
        width: 800,
        height: 600,
        alt: 'River Tiger Resort location map and directions to Chakrata',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@rivertigerresort', // Replace with actual Twitter handle
    creator: '@rivertigerresort',
    title: 'Contact River Tiger Resort | Bookings & Inquiries | Chakrata',
    description: 'Contact us for bookings and inquiries. Located near Tiger Fall, Chakrata. Experience the best mountain hospitality in Dehradun, Uttarakhand.',
    images: ['/images/contact-resort.jpg'], // Replace with actual image path
  },
  alternates: {
    canonical: 'https://rivertigerresort.com/contact',
  },
  category: 'travel',
  classification: 'Contact Information and Booking Details',
  other: {
    'contact:phone_number': '+91-XXXXXXXXXX', // Add actual phone number
    'contact:email': 'info@rivertigerresort.com', // Add actual email
    'geo.region': 'IN-UT',
    'geo.placename': 'Chakrata, Dehradun, Uttarakhand',
    'geo.position': '30.7046;77.8672', // Replace with actual coordinates
    'ICBM': '30.7046, 77.8672', // Replace with actual coordinates
  },
};

// JSON-LD structured data for Contact page
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  mainEntity: {
    '@type': 'Resort',
    name: 'River Tiger Resort & Camping Adventure',
    description: 'Premier mountain resort near Tiger Fall offering adventure activities and comfortable accommodation in Chakrata, Dehradun',
    url: 'https://rivertigerresort.com',
    logo: 'https://rivertigerresort.com/images/logo.jpg', // Replace with actual logo URL
    image: 'https://rivertigerresort.com/images/resort-main.jpg', // Replace with actual image
    
    // Contact Information
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+91-XXXXXXXXXX', // Replace with actual phone number
        contactType: 'reservations',
        areaServed: 'IN',
        availableLanguage: ['English', 'Hindi'],
        hoursAvailable: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          opens: '08:00',
          closes: '20:00',
        },
      },
      {
        '@type': 'ContactPoint',
        telephone: '+91-XXXXXXXXXX', // Replace with emergency contact
        contactType: 'customer support',
        areaServed: 'IN',
        availableLanguage: ['English', 'Hindi'],
      },
    ],
    
    // Address and Location
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Near Tiger Fall',
      addressLocality: 'Chakrata',
      addressRegion: 'Uttarakhand',
      postalCode: '248123', // Add actual postal code
      addressCountry: 'IN',
    },
    
    // Geographic Coordinates
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 30.7046, // Replace with actual coordinates
      longitude: 77.8672,
    },
    
    // Contact Methods
    email: 'info@rivertigerresort.com', // Replace with actual email
    telephone: '+91-XXXXXXXXXX', // Replace with actual phone
    faxNumber: '+91-XXXXXXXXXX', // Add if available
    
    // Opening Hours
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '24:00', // Resort operates 24/7
      closes: '24:00',
    },
    
    // Services Offered
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Resort Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Room Reservations',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Adventure Activity Booking',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Event Planning',
          },
        },
      ],
    },
    
    // Social Media
    sameAs: [
      'https://www.facebook.com/rivertigerresort', // Add actual social media URLs
      'https://www.instagram.com/rivertigerresort',
      'https://www.twitter.com/rivertigerresort',
    ],
  },
  
  // Breadcrumb Navigation
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
        name: 'Contact Us',
        item: 'https://rivertigerresort.com/contact',
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
        <ContactUs />
        <Footer />
      </div>
    </>
  );
}
