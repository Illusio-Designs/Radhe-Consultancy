import React from 'react';

const FactoryAct = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Factory Act License</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid gap-6">
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-4">Factory Act License Management</h2>
            <p className="text-gray-600">
              Manage your factory licenses and ensure compliance with the Factory Act regulations.
              Track, renew, and maintain all your factory-related licenses in one place.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">License Management</h3>
              <ul className="list-disc list-inside text-gray-600">
                <li>License Application</li>
                <li>Renewal Tracking</li>
                <li>Compliance Monitoring</li>
                <li>Document Repository</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Compliance Features</h3>
              <ul className="list-disc list-inside text-gray-600">
                <li>Safety Standards</li>
                <li>Inspection Reports</li>
                <li>Regulatory Updates</li>
                <li>Compliance Calendar</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FactoryAct; 