import React from 'react'
import Hero from './Hero'

import Footer from './Footer'
import StaySection from './StaySection'
import AboutSection from './AboutSection'
import LocationSection from './LocatonSection'
import ComfortFeatures from './ComfortFeatures'
import ExperiencesSection from './ExperiencesSection'
import EventSection from './EventSection'
import Gallery from './Gallery'
const Home = () => {
  return (
    <div className="bg-blue-100">
        <Hero />
        <AboutSection/>
        <StaySection/>
        <ExperiencesSection/>
        <ComfortFeatures/>
        <EventSection/>
        <Gallery />
        <LocationSection/>
        <Footer/>
    </div>
  )
}

export default Home