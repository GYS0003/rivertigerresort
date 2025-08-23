import React from 'react';

const TermsandConditions = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 text-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Terms & Conditions
          </h1>
          <p className="text-gray-400 text-lg">
            River Tiger Resort - Last updated: August 23, 2025
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 sm:p-12 border border-white/10 space-y-8">
          
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4 flex items-center">
              <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></span>
              Introduction
            </h2>
            <div className="text-gray-300 space-y-4 leading-relaxed">
              <p>
                For the purpose of these Terms and Conditions, the term <strong className="text-white">"we"</strong>, <strong className="text-white">"us"</strong>, <strong className="text-white">"our"</strong> used anywhere on this page shall mean <strong className="text-cyan-400">River Tiger Resort</strong>, whose registered/operational office is located at:
              </p>
              <div className="bg-white/5 p-4 rounded-lg border-l-4 border-cyan-400">
                <p className="font-medium">SAWARA, CHAKARATA 248123<br />Tungra BO 248123, India</p>
              </div>
              <p>
                The terms <strong className="text-white">"you"</strong>, <strong className="text-white">"your"</strong>, <strong className="text-white">"user"</strong>, <strong className="text-white">"visitor"</strong> shall mean any natural or legal person who is visiting our website and/or agreed to purchase from us.
              </p>
            </div>
          </section>

          {/* Terms of Use */}
          <section>
            <h2 className="text-2xl font-bold text-purple-400 mb-4 flex items-center">
              <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
              Terms of Use
            </h2>
            <div className="text-gray-300 space-y-4 leading-relaxed">
              <p><strong className="text-white">Your use of the website and/or purchase from us are governed by the following Terms and Conditions:</strong></p>
              
              <ul className="space-y-3 ml-4">
                <li className="flex items-start">
                  <span className="text-cyan-400 mr-2 mt-2">•</span>
                  The content of the pages of this website is subject to change without notice.
                </li>
                <li className="flex items-start">
                  <span className="text-cyan-400 mr-2 mt-2">•</span>
                  Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness or suitability of the information and materials found or offered on this website for any particular purpose.
                </li>
                <li className="flex items-start">
                  <span className="text-cyan-400 mr-2 mt-2">•</span>
                  Your use of any information or materials on our website and/or product pages is entirely at your own risk, for which we shall not be liable.
                </li>
                <li className="flex items-start">
                  <span className="text-cyan-400 mr-2 mt-2">•</span>
                  It shall be your own responsibility to ensure that any products, services or information available through our website meet your specific requirements.
                </li>
              </ul>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-green-400 mb-4 flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
              Intellectual Property Rights
            </h2>
            <div className="text-gray-300 space-y-4 leading-relaxed">
              <p>
                Our website contains material which is owned by or licensed to us. This material includes, but is not limited to, the design, layout, look, appearance, graphics, photographs, and content.
              </p>
              <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg">
                <p className="text-yellow-300">
                  <strong>⚠️ Important:</strong> Reproduction of any content is prohibited other than in accordance with the copyright notice, which forms part of these terms and conditions.
                </p>
              </div>
              <p>
                All trademarks reproduced in our website which are not the property of, or licensed to, the operator are acknowledged on the website. Unauthorized use of information provided by us shall give rise to a claim for damages and/or be a criminal offense.
              </p>
            </div>
          </section>

          {/* Updated Refund Policy */}
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

          {/* Payment Terms */}
          <section>
            <h2 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center">
              <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
              Payment Terms
            </h2>
            <div className="text-gray-300 space-y-4 leading-relaxed">
              <p>
                We shall be under no liability whatsoever in respect of any loss or damage arising directly or indirectly out of the decline of authorization for any transaction, on account of the cardholder having exceeded the preset limit mutually agreed by us with our acquiring bank from time to time.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-lg">
                  <h4 className="text-white font-semibold mb-2">Accepted Payment Methods</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Credit/Debit Cards</li>
                    <li>• Net Banking</li>
                    <li>• UPI Payments</li>
                    <li>• Bank Transfers</li>
                  </ul>
                </div>
                <div className="bg-white/5 p-4 rounded-lg">
                  <h4 className="text-white font-semibold mb-2">Security</h4>
                  <p className="text-sm">All payments are processed through secure, encrypted channels with industry-standard security protocols.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Liability & Legal */}
          <section>
            <h2 className="text-2xl font-bold text-indigo-400 mb-4 flex items-center">
              <span className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></span>
              Liability & Legal Jurisdiction
            </h2>
            <div className="text-gray-300 space-y-4 leading-relaxed">
              <p>
                You may not create a link to our website from another website or document without River Tiger Resort's prior written consent.
              </p>
              <div className="bg-indigo-500/10 border border-indigo-500/30 p-4 rounded-lg">
                <p className="text-indigo-300">
                  <strong>Governing Law:</strong> Any dispute arising out of use of our website and/or purchase with us and/or any engagement with us is subject to the <strong className="text-white">laws of India</strong>.
                </p>
              </div>
              <p>
                From time to time our website may also include links to other websites. These links are provided for your convenience to provide further information. We do not endorse or take responsibility for the content of linked websites.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4 flex items-center">
              <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></span>
              Contact Us
            </h2>
            <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 p-6 rounded-lg border border-cyan-500/30">
              <p className="text-gray-300 mb-4">
                If you have any questions regarding these Terms and Conditions or our Refund Policy, please contact us:
              </p>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-cyan-300 font-semibold">Address:</p>
                  <p className="text-white">SAWARA, CHAKARATA 248123<br />Tungra BO 248123, India</p>
                </div>
                <div>
                  <p className="text-cyan-300 font-semibold">Business Hours:</p>
                  <p className="text-white">24/7 Guest Services<br />Office: 9:00 AM - 6:00 PM IST</p>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="text-center pt-8 border-t border-white/10">
            <p className="text-gray-500 text-sm">
              © 2025 River Tiger Resort. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsandConditions;
