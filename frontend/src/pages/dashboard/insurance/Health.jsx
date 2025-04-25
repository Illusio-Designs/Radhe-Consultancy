import React from 'react';

const Health = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Health Insurance</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid gap-6">
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-4">Health Insurance Overview</h2>
            <p className="text-gray-600">
              Comprehensive health insurance solutions for individuals and organizations.
              Manage your health insurance policies, claims, and benefits all in one place.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Policy Management</h3>
              <ul className="list-disc list-inside text-gray-600">
                <li>View and manage active policies</li>
                <li>Track policy renewals</li>
                <li>Update policy details</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Claims Processing</h3>
              <ul className="list-disc list-inside text-gray-600">
                <li>Submit new claims</li>
                <li>Track claim status</li>
                <li>View claim history</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Health; 