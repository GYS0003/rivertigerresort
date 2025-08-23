import React from 'react';

const PrivacyandPolicy = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 text-white py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
                        Cancellation & Refund Policy
                    </h1>
                    <p className="text-gray-400 text-lg">
                        River Tiger Resort - Last updated: August 16, 2025
                    </p>
                </div>

                {/* Main Content */}
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 sm:p-12 border border-white/10 space-y-8">

                    {/* Introduction */}
                    <section>
                        <div className="bg-cyan-500/10 border border-cyan-500/30 p-6 rounded-lg mb-6">
                            <h2 className="text-2xl font-bold text-cyan-400 mb-4 flex items-center">
                                <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></span>
                                Our Commitment
                            </h2>
                            <p className="text-gray-300 leading-relaxed">
                                River Tiger Resort believes in helping its customers as far as possible, and has therefore a <strong className="text-white">liberal cancellation policy</strong>. We strive to ensure customer satisfaction while maintaining fair business practices.
                            </p>
                        </div>
                    </section>


  <section>
            <h2 className="text-2xl font-bold text-red-400 mb-4 flex items-center">
              <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
              Refund & Cancellation Policy
            </h2>
            <div className="text-gray-300 space-y-6 leading-relaxed">
              <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-lg">
                <h4 className="text-red-300 font-bold text-lg mb-4">Cancellation Timeline & Refunds</h4>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="font-medium">7+ days before check-in</span>
                    <span className="text-green-400 font-bold">100% Refund</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="font-medium">6 days before check-in</span>
                    <span className="text-yellow-400 font-bold">75% Refund</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="font-medium">5 days before check-in</span>
                    <span className="text-orange-400 font-bold">50% Refund</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="font-medium">4 days before check-in</span>
                    <span className="text-red-300 font-bold">25% Refund</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="font-medium">≤3 days before check-in</span>
                    <span className="text-red-400 font-bold">No Refund</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-white font-semibold text-lg">Refund Process</h4>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start">
                    <span className="text-red-400 mr-2 mt-2">•</span>
                    Refunds will be processed within <strong className="text-white">7-10 business days</strong> after approval
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-400 mr-2 mt-2">•</span>
                    Refunds will be credited to the original payment method used for booking
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-400 mr-2 mt-2">•</span>
                    Processing fees (if any) are non-refundable
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-400 mr-2 mt-2">•</span>
                    Special packages and promotional rates may have different cancellation terms
                  </li>
                </ul>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg">
                <h4 className="text-blue-300 font-semibold mb-2">Force Majeure & Emergency Situations</h4>
                <p className="text-sm">
                  In case of natural disasters, government restrictions, or other unforeseen circumstances beyond our control, we will work with guests to reschedule or provide appropriate compensation on a case-by-case basis.
                </p>
              </div>
            </div>
          </section>



            {/* Refund Processing */}
            <section>
                <h2 className="text-2xl font-bold text-indigo-400 mb-6 flex items-center">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></span>
                    Refund Processing
                </h2>

                <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-6 rounded-lg border border-indigo-500/30">
                    <div className="flex items-center justify-center mb-6">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-indigo-300 mb-2">3-5</div>
                            <div className="text-indigo-400 font-medium">Business Days</div>
                        </div>
                    </div>

                    <p className="text-gray-300 text-center leading-relaxed">
                        In case of any <strong className="text-white">refunds approved by River Tiger Resort</strong>, it will take <strong className="text-indigo-300">3-5 days for the refund to be processed</strong> to the end customer.
                    </p>

                    <div className="mt-6 bg-white/5 p-4 rounded-lg">
                        <h4 className="text-white font-semibold mb-2">Refund Method</h4>
                        <p className="text-gray-400 text-sm">
                            Refunds will be credited to the original payment method used for the purchase. Processing time may vary depending on your bank or payment provider.
                        </p>
                    </div>
                </div>
            </section>

            {/* Customer Service Contact */}
            <section>
                <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></span>
                    Customer Service
                </h2>

                <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-6 rounded-lg border border-cyan-500/30">
                    <p className="text-gray-300 mb-6 text-center">
                        For any cancellation requests, refund inquiries, or product quality issues, please contact our Customer Service team:
                    </p>

                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="text-center">
                            <h4 className="text-cyan-300 font-semibold mb-2">📧 Email Support</h4>
                            <p className="text-white">Available 24/7</p>
                            <p className="text-gray-400 text-sm">Response within 24 hours</p>
                        </div>
                        <div className="text-center">
                            <h4 className="text-cyan-300 font-semibold mb-2">📞 Phone Support</h4>
                            <p className="text-white">9:00 AM - 6:00 PM IST</p>
                            <p className="text-gray-400 text-sm">Monday to Saturday</p>
                        </div>
                    </div>

                    <div className="mt-6 bg-cyan-500/10 border border-cyan-500/30 p-4 rounded-lg">
                        <p className="text-cyan-300 text-center text-sm">
                            <strong>Quick Tip:</strong> Have your order number ready when contacting customer service for faster assistance.
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <div className="text-center pt-8 border-t border-white/10">
                <p className="text-gray-500 text-sm mb-2">
                    This policy is designed to ensure fair treatment for all customers while maintaining quality service standards.
                </p>
                <p className="text-gray-500 text-xs">
                    © 2025 River Tiger Resort. All rights reserved.
                </p>
            </div>
        </div>
      </div >
    </div >
  );
};

export default PrivacyandPolicy;
