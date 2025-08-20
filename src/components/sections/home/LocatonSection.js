'use client'

export default function LocationSection() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
      {/* Heading */}
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold text-green-900 mb-6">
        Find Us in Chakrata
      </h2>

      {/* Embedded Google Map */}
      <div className="w-full h-64 sm:h-80 md:h-[450px] rounded-xl overflow-hidden shadow-lg">
        <iframe
          title="River Tiger Resort Map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3430.6561067263733!2d77.89057467424897!3d30.699950474600033!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390f4b0a16e94205%3A0x129cbabf9f590c3!2sRiver%20Tiger%20Resort%20%26%20Camping%20Adventure%20%7C%20Chakrata%20hotels%20and%20resorts%20%7C%20Tiger%20fall%20resort%20chakrata%20%7C%20Camping%20in%20Chakrata!5e0!3m2!1sen!2sin!4v1753690442780!5m2!1sen!2sin" 
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={true}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>


      {/* Address and Info */}
      <div className="mt-6 text-base sm:text-lg text-gray-800">
        <p className="flex justify-center items-center gap-2">
          📍 <span>Village Kanasar, Chakrata, Uttarakhand</span>
        </p>
        <p className="flex justify-center items-center gap-2 mt-2">
          🚗 <span>6 hrs from Dehradun | Parking Available</span>
        </p>
      </div>
    </section>
  );
}
