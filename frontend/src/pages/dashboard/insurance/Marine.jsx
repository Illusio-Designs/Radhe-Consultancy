import React from 'react';

const Marine = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Marine Insurance</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid gap-6">
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-4">Marine Insurance Overview</h2>
            <p className="text-gray-600">
              Comprehensive marine insurance coverage for vessels, cargo, and marine operations.
              Protect your maritime assets with our specialized insurance solutions.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Coverage Types</h3>
              <ul className="list-disc list-inside text-gray-600">
                <li>Hull Insurance</li>
                <li>Cargo Insurance</li>
                <li>Marine Liability</li>
                <li>Port Risk Coverage</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Policy Features</h3>
              <ul className="list-disc list-inside text-gray-600">
                <li>Worldwide Coverage</li>
                <li>24/7 Claims Support</li>
                <li>Risk Assessment</li>
                <li>Emergency Response</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marine; 