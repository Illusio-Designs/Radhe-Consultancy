import React from 'react';

const Vehicle = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Vehicle Insurance</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid gap-6">
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-4">Vehicle Insurance Overview</h2>
            <p className="text-gray-600">
              Comprehensive vehicle insurance solutions for your fleet and individual vehicles.
              Protect your automotive assets with our tailored coverage options.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Coverage Types</h3>
              <ul className="list-disc list-inside text-gray-600">
                <li>Comprehensive Coverage</li>
                <li>Third Party Liability</li>
                <li>Personal Accident Cover</li>
                <li>Zero Depreciation</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Additional Features</h3>
              <ul className="list-disc list-inside text-gray-600">
                <li>24/7 Roadside Assistance</li>
                <li>Cashless Claims</li>
                <li>NCB Protection</li>
                <li>Engine Protection</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vehicle; 