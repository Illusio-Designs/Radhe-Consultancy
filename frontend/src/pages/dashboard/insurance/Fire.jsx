import React from 'react';

const Fire = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Fire Insurance</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid gap-6">
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-4">Fire Insurance Overview</h2>
            <p className="text-gray-600">
              Protect your property and assets against fire-related damages.
              Comprehensive coverage for buildings, equipment, and contents.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Coverage Areas</h3>
              <ul className="list-disc list-inside text-gray-600">
                <li>Building Structure</li>
                <li>Business Equipment</li>
                <li>Inventory Protection</li>
                <li>Business Interruption</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Additional Benefits</h3>
              <ul className="list-disc list-inside text-gray-600">
                <li>Smoke Damage Coverage</li>
                <li>Emergency Response</li>
                <li>Temporary Relocation</li>
                <li>Risk Assessment Services</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Fire; 