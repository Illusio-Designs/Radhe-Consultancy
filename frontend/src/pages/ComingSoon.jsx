import React from 'react';

const ComingSoon = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full text-center">
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-primary-900 mb-4">
            Coming Soon
          </h1>
          <p className="text-xl md:text-2xl text-primary-700 mb-8">
            We're working hard to bring you something amazing. Stay tuned!
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-primary-50 rounded-xl">
              <div className="text-primary-600 text-4xl mb-4">
                <i className="lni lni-users"></i>
              </div>
              <h3 className="text-lg font-semibold text-primary-900 mb-2">For Consumers</h3>
              <p className="text-primary-700">Find and connect with trusted consultants</p>
            </div>
            <div className="p-6 bg-primary-50 rounded-xl">
              <div className="text-primary-600 text-4xl mb-4">
                <i className="lni lni-briefcase"></i>
              </div>
              <h3 className="text-lg font-semibold text-primary-900 mb-2">For Companies</h3>
              <p className="text-primary-700">Grow your business with expert guidance</p>
            </div>
            <div className="p-6 bg-primary-50 rounded-xl">
              <div className="text-primary-600 text-4xl mb-4">
                <i className="lni lni-customer"></i>
              </div>
              <h3 className="text-lg font-semibold text-primary-900 mb-2">For Consultants</h3>
              <p className="text-primary-700">Share your expertise and grow your network</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-primary-600">
            <p>Want to learn more?</p>
            <a href="mailto:contact@radheconsultancy.com" className="hover:text-primary-700">
              contact@radheconsultancy.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon; 