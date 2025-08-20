'use client'

import {
  FaBed,
  FaUtensils,
  FaChild,
  FaCar,
  FaCampground,
  FaFireAlt,
  FaHiking,
  FaWifi,
  FaDog,
  FaWater,
  FaSwimmingPool,
  FaSpa,
  FaCoffee,
  FaBicycle,
  FaFirstAid,
  FaFan
} from 'react-icons/fa'

export default function ComfortFeatures() {
  const features = [
    { icon: <FaBed className="w-6 h-6" />, label: 'Cozy Beds\n& Blankets' },
    { icon: <FaUtensils className="w-6 h-6" />, label: 'Restaurant' },
    { icon: <FaChild className="w-6 h-6" />, label: 'Kids Play\nArea' },
    { icon: <FaCar className="w-6 h-6" />, label: 'Parking' },
    { icon: <FaCampground className="w-6 h-6" />, label: 'Tent Camping' },
    { icon: <FaFireAlt className="w-6 h-6" />, label: 'Bonfire\nEvenings' },
    { icon: <FaHiking className="w-6 h-6" />, label: 'Trekking\nTrails' },
    { icon: <FaWifi className="w-6 h-6" />, label: 'Free Wi-Fi' },
    { icon: <FaDog className="w-6 h-6" />, label: 'Pet\nFriendly' },
    { icon: <FaWater className="w-6 h-6" />, label: 'River\nAccess' },
    { icon: <FaSwimmingPool className="w-6 h-6" />, label: 'Private\nPool' },
    { icon: <FaSpa className="w-6 h-6" />, label: 'Spa &\nWellness' },
    { icon: <FaCoffee className="w-6 h-6" />, label: 'Tea &\nCoffee' },
    { icon: <FaBicycle className="w-6 h-6" />, label: 'Bike\nRental' },
    { icon: <FaFirstAid className="w-6 h-6" />, label: 'First Aid\nAvailable' },
    { icon: <FaFan className="w-6 h-6" />, label: 'Fan &\nCooling' },
  ]

  return (
    <section className="bg-[#F4EBD0] py-10 px-4 sm:px-6 lg:px-8 text-[#163B2A] font-sans">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center text-2xl sm:text-3xl font-serif font-semibold mb-8">
          Everything You Need for a Comfortable Stay
        </h2>

        {/* Scrollable Container on Small Screens */}
        <div className="overflow-x-auto sm:overflow-visible">
          <div className="flex sm:grid sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-5 sm:place-items-center min-w-[640px] sm:min-w-0">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex-shrink-0 flex flex-col items-center justify-center p-4 w-28 h-28 border border-[#163B2A] rounded-lg text-center text-sm font-medium whitespace-pre-line scroll-snap-align-start"
              >
                {feature.icon}
                <span className="mt-2">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
